import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Droplet, 
  Warehouse, 
  Wrench, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { inventoryService } from '../../services/inventoryService';
import { Appointment } from '../../types/appointment';
import { Item } from '../../types/item';
import { getStatusLabel, getStatusBadgeClass } from '../../lib/workshop';

export const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsData, invData] = await Promise.all([
          appointmentService.getAll(),
          inventoryService.getAll()
        ]);
        setAppointments(apptsData);
        setInventory(invData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calcular métricas
  const totalCitas = appointments.filter(a => a.service_type === 'mecanica').length;
  const totalLavados = appointments.filter(a => a.service_type === 'lavado' && a.status !== 'completado' && a.status !== 'cancelado').length;
  const repuestosBajos = inventory.filter(item => item.current_stock <= (item.max_stock * 0.2)).length;
  const citasPendientes = appointments.filter(a => a.status === 'pendiente' || a.status === 'en_progreso').length;

  // Filtrar citas de hoy
  const todayStr = new Date().toISOString().split('T')[0];
  const citasHoy = appointments.filter(a => a.date === todayStr);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Panel de Control</h2>
          <p>Monitoreo en tiempo real de servicios, citas y almacén de repuestos.</p>
        </div>
        <Link to="/agendar" className="btn btn-primary" target="_blank">
          <ArrowUpRight size={18} />
          Ver Formulario Público
        </Link>
      </div>

      {/* Grid de Métricas */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <h4>Mantenimientos</h4>
            <div className="value">{totalCitas}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Citas mecánicas</p>
          </div>
          <div className="metric-icon">
            <Wrench size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h4>Cola de Lavadero</h4>
            <div className="value">{totalLavados}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Motos por lavar hoy</p>
          </div>
          <div className="metric-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--color-info)', borderColor: 'rgba(59, 130, 246, 0.15)' }}>
            <Droplet size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h4>Stock Crítico</h4>
            <div className="value" style={{ color: repuestosBajos > 0 ? 'var(--color-danger)' : 'inherit' }}>
              {repuestosBajos}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Repuestos con bajo stock</p>
          </div>
          <div className="metric-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h4>Servicios Activos</h4>
            <div className="value">{citasPendientes}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Pendientes o en curso</p>
          </div>
          <div className="metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Grid Principal del Dashboard */}
      <div className="dashboard-grid">
        {/* Lado izquierdo: Lista de servicios de hoy */}
        <div className="card">
          <div className="card-title">
            <Clock size={20} style={{ color: 'var(--color-accent)' }} />
            <span>Servicios Programados para Hoy ({citasHoy.length})</span>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Cargando datos...</p>
          ) : citasHoy.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
              No hay servicios agendados para la fecha de hoy.
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th>Moto / Placa</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citasHoy.map((appt) => (
                    <tr key={appt.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{appt.time}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{appt.client_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{appt.client_phone}</div>
                      </td>
                      <td>
                        <div>{appt.motorcycle_model}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: '600' }}>
                          {appt.motorcycle_plate.toUpperCase()}
                        </div>
                      </td>
                      <td>
                        {appt.service_type === 'mecanica' ? (
                          <span style={{ color: 'var(--color-accent)', fontWeight: '500' }}>Mecánica</span>
                        ) : (
                          <span style={{ color: 'var(--color-info)', fontWeight: '500' }}>Lavado</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(appt.status)}`}>
                          {getStatusLabel(appt.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lado derecho: Widgets Rápidos de Alertas y Estadísticas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Alertas de Stock */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-title" style={{ fontSize: '18px' }}>
              <Warehouse size={18} style={{ color: 'var(--color-danger)' }} />
              <span>Alertas de Inventario</span>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
            ) : inventory.filter(i => i.current_stock <= (i.max_stock * 0.2)).length === 0 ? (
              <p style={{ color: 'var(--color-success)', fontSize: '14px', fontWeight: '500' }}>
                ✓ Todos los repuestos tienen stock suficiente.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {inventory
                  .filter(item => item.current_stock <= (item.max_stock * 0.2))
                  .slice(0, 4)
                  .map(item => (
                    <div 
                      key={item.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '12px', 
                        backgroundColor: 'rgba(255,255,255,0.01)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Categoría: {item.category}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-danger)' }}>
                          {item.current_stock}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}> / {item.max_stock} {item.unit}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Gráfico Rápido de Capacidad de Servicios */}
          <div className="card">
            <div className="card-title" style={{ fontSize: '18px' }}>
              <ClipboardList size={18} style={{ color: 'var(--color-accent)' }} />
              <span>Capacidad Diaria</span>
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mecánica (Max 5/día)</span>
                  <span style={{ fontWeight: '600' }}>{appointments.filter(a => a.service_type === 'mecanica' && a.date === todayStr).length} / 5</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      background: 'var(--accent-gradient)',
                      width: `${Math.min((appointments.filter(a => a.service_type === 'mecanica' && a.date === todayStr).length / 5) * 100, 100)}%`,
                      borderRadius: '4px',
                      transition: 'var(--transition-smooth)'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Lavadero (Max 8/día)</span>
                  <span style={{ fontWeight: '600' }}>{appointments.filter(a => a.service_type === 'lavado' && a.date === todayStr).length} / 8</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      backgroundColor: 'var(--color-info)',
                      width: `${Math.min((appointments.filter(a => a.service_type === 'lavado' && a.date === todayStr).length / 8) * 100, 100)}%`,
                      borderRadius: '4px',
                      transition: 'var(--transition-smooth)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
