import React, { useState, useEffect } from 'react';
import { Warehouse, Plus, Search, Trash2, AlertCircle, X, Check, Minus } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { Item, ItemCreate } from '../../types/item';

// Mapa de stock pendiente por item: { [itemId]: newStockValue }
type PendingStockMap = Record<string, number>;

export const Inventario: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('todos');

  // Estado del formulario para agregar repuestos
  const [formData, setFormData] = useState<ItemCreate>({
    name: '',
    category: 'Repuestos',
    current_stock: 0,
    max_stock: 10,
    unit: 'Unidades',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mapa de stock pendiente (cambios no confirmados aún)
  const [pendingStock, setPendingStock] = useState<PendingStockMap>({});
  // Mapa de items que están guardándose en este momento
  const [savingItems, setSavingItems] = useState<Record<string, boolean>>({});

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inventoryService.getAll();
      setItems(data);
    } catch (err: any) {
      setError(
        'No se pudo conectar con el servidor de FastAPI. Verifica que tu backend esté corriendo y la base de datos esté configurada en tu archivo .env.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('stock') ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'Repuestos',
      current_stock: 0,
      max_stock: 10,
      unit: 'Unidades',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const newItem = await inventoryService.create(formData);
      setItems((prev) => [...prev, newItem]);
      handleCloseModal();
    } catch (err: any) {
      setError('Error al agregar el repuesto: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este repuesto?')) return;
    setError('');

    try {
      await inventoryService.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError('Error al eliminar el repuesto: ' + (err.message || err));
    }
  };

  // Ajusta el stock pendiente para un item (+1 o -1)
  const adjustPendingStock = (item: Item, delta: 1 | -1) => {
    setPendingStock((prev) => {
      const base = prev[item.id] !== undefined ? prev[item.id] : item.current_stock;
      const next = base + delta;
      if (next < 0) return prev; // No bajar de 0
      return { ...prev, [item.id]: next };
    });
  };

  // Cancela los cambios pendientes de un item
  const cancelPendingStock = (itemId: string) => {
    setPendingStock((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  // Confirma y persiste el stock pendiente de un item
  const confirmPendingStock = async (item: Item) => {
    const newStock = pendingStock[item.id];
    if (newStock === undefined || newStock === item.current_stock) {
      cancelPendingStock(item.id);
      return;
    }
    setSavingItems((prev) => ({ ...prev, [item.id]: true }));
    setError('');
    try {
      const updated = await inventoryService.update(item.id, { current_stock: newStock });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      cancelPendingStock(item.id);
    } catch (err: any) {
      setError('Error al actualizar el stock: ' + (err.message || err));
    } finally {
      setSavingItems((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
    }
  };

  // Filtrar items por búsqueda y pestaña de categoría activa
  const filteredItems = items.filter(
    (item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      
      const matchesTab = selectedCategoryTab === 'todos' || item.category === selectedCategoryTab;
      
      return matchesSearch && matchesTab;
    }
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Inventario de Repuestos</h2>
          <p>Control de existencias de repuestos, lubricantes y consumibles del taller.</p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary">
          <Plus size={18} />
          Agregar Repuesto
        </button>
      </div>

      {error && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '16px 20px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'var(--color-danger-bg)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--color-danger)',
            fontSize: '15px',
            marginBottom: '28px',
            lineHeight: '1.5'
          }}
        >
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <div>
            <span>{error}</span>
            <button 
              onClick={fetchItems}
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '12px', marginLeft: '16px', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              Reintentar Conexión
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)' 
            }} 
          />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Buscar por nombre o categoría..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '46px' }}
          />
        </div>
      </div>

      {/* Pestañas de Consulta Rápida */}
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px'
        }}
      >
        {[
          { id: 'todos', label: 'Todos los Productos' },
          { id: 'Lubricantes', label: 'Aceites / Lubricantes' },
          { id: 'Eléctricos', label: 'Eléctricos' },
          { id: 'Fríos', label: 'Fríos' },
          { id: 'Repuestos', label: 'Repuestos' },
          { id: 'Frenos', label: 'Frenos' },
          { id: 'Motor', label: 'Motor' },
          { id: 'Accesorios', label: 'Accesorios' },
        ].map((tab) => {
          const isActive = selectedCategoryTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategoryTab(tab.id)}
              className="btn"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                backgroundColor: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.02)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: isActive ? 'none' : '1px solid var(--border-color)',
                boxShadow: isActive ? 'var(--accent-glow)' : 'none',
                fontWeight: '600'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabla de Resultados */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Cargando inventario...</p>
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <Warehouse size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', display: 'inline-block' }} />
          <p>No se encontraron repuestos en el inventario.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Repuesto</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Máximo</th>
                <th>Unidad</th>
                <th>Notas</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                // Valor que se muestra: pendiente si hay cambios, sino el real
                const displayStock = pendingStock[item.id] !== undefined ? pendingStock[item.id] : item.current_stock;
                const hasPending = pendingStock[item.id] !== undefined && pendingStock[item.id] !== item.current_stock;
                const isSaving = !!savingItems[item.id];

                // Semaforización: proporción respecto al máximo (basada en displayStock para feedback inmediato)
                const ratio = item.max_stock > 0 ? displayStock / item.max_stock : 0;
                const semaphore = ratio <= 0.25
                  ? { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', label: 'CRÍTICO' }
                  : ratio <= 0.50
                  ? { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'BAJO' }
                  : { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', label: 'ÓPTIMO' };

                return (
                  <tr key={item.id} style={hasPending ? { backgroundColor: 'rgba(245,158,11,0.04)' } : undefined}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</td>
                    <td>{item.category}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Botón Restar */}
                        <button
                          onClick={() => adjustPendingStock(item, -1)}
                          disabled={displayStock <= 0 || isSaving}
                          title="Restar 1 unidad"
                          style={{
                            width: '26px', height: '26px', borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: 'rgba(255,255,255,0.04)',
                            color: displayStock <= 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                            cursor: displayStock <= 0 || isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Minus size={12} />
                        </button>

                        {/* Valor + badge semáforo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontWeight: '800',
                            fontSize: '16px',
                            color: hasPending ? '#f59e0b' : semaphore.color,
                            minWidth: '24px',
                            textAlign: 'center',
                            transition: 'color 0.2s',
                          }}>
                            {displayStock}
                          </span>
                          {hasPending && (
                            <span style={{
                              fontSize: '10px', padding: '1px 5px', borderRadius: '12px',
                              backgroundColor: 'rgba(245,158,11,0.15)',
                              color: '#f59e0b',
                              border: '1px solid rgba(245,158,11,0.35)',
                              fontWeight: '700',
                            }}>
                              antes: {item.current_stock}
                            </span>
                          )}
                          {!hasPending && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 7px',
                              borderRadius: '20px',
                              backgroundColor: semaphore.bg,
                              color: semaphore.color,
                              border: `1px solid ${semaphore.border}`,
                              fontWeight: '700',
                              letterSpacing: '0.04em',
                            }}>
                              {semaphore.label}
                            </span>
                          )}
                        </div>

                        {/* Botón Sumar */}
                        <button
                          onClick={() => adjustPendingStock(item, 1)}
                          disabled={isSaving}
                          title="Sumar 1 unidad"
                          style={{
                            width: '26px', height: '26px', borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'var(--text-secondary)',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Plus size={12} />
                        </button>

                        {/* Botones Confirmar / Cancelar inline — solo visibles con cambios pendientes */}
                        {hasPending && (
                          <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                            <button
                              onClick={() => confirmPendingStock(item)}
                              disabled={isSaving}
                              title="Confirmar cambio de stock"
                              style={{
                                height: '26px', padding: '0 10px', borderRadius: '6px',
                                background: 'rgba(34,197,94,0.15)',
                                border: '1px solid rgba(34,197,94,0.4)',
                                color: '#22c55e',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '11px', fontWeight: '700',
                                flexShrink: 0,
                                transition: 'all 0.15s',
                              }}
                            >
                              <Check size={12} />
                              {isSaving ? 'Guardando…' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => cancelPendingStock(item.id)}
                              disabled={isSaving}
                              title="Descartar cambios"
                              style={{
                                width: '26px', height: '26px', borderRadius: '6px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#ef4444',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{item.max_stock}</td>
                    <td>{item.unit}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.notes || '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-danger"
                        style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
                        title="Eliminar Repuesto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* El diálogo modal fue reemplazado por botones inline de Confirmar/Cancelar por fila */}

      {/* Modal para Agregar Repuesto */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} style={{ color: 'var(--color-accent)' }} />
                Nuevo Repuesto
              </h3>
              <button 
                onClick={handleCloseModal} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre del Repuesto</label>
                <input 
                  id="name"
                  name="name"
                  type="text" 
                  className="form-control" 
                  placeholder="Ej. Filtro de Aceite Yamaha FZ" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="category">Categoría</label>
                  <select 
                    id="category"
                    name="category" 
                    className="form-control" 
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Repuestos">Repuestos</option>
                    <option value="Lubricantes">Lubricantes</option>
                    <option value="Frenos">Frenos</option>
                    <option value="Motor">Motor</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Eléctricos">Eléctricos</option>
                    <option value="Fríos">Fríos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="unit">Unidad de Medida</label>
                  <input 
                    id="unit"
                    name="unit"
                    type="text" 
                    className="form-control" 
                    placeholder="Ej. Unidades, Litros" 
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="current_stock">Stock Inicial Actual</label>
                  <input 
                    id="current_stock"
                    name="current_stock"
                    type="number" 
                    min="0"
                    className="form-control" 
                    value={formData.current_stock}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="max_stock">Stock Recomendado Máximo</label>
                  <input 
                    id="max_stock"
                    name="max_stock"
                    type="number" 
                    min="1"
                    className="form-control" 
                    value={formData.max_stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notas o Descripción del Producto</label>
                <textarea 
                  id="notes"
                  name="notes"
                  rows={3} 
                  className="form-control" 
                  placeholder="Especificaciones técnicas, ubicaciones en estante..." 
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Repuesto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
