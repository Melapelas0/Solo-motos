import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  HelpCircle, 
  Clock, 
  Search, 
  DollarSign,
  Briefcase,
  Layers,
  RefreshCw,
  FileText,
  Droplet
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types/appointment';
import { formatDateLegible } from '../../lib/workshop';

interface ParsedWash {
  label: string;
  price: number;
}

export const Historial: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Date states - default to current month and year
  const currentDate = new Date();
  const currentMonthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(currentDate.getFullYear());
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const months = [
    { value: '01', name: 'Enero' },
    { value: '02', name: 'Febrero' },
    { value: '03', name: 'Marzo' },
    { value: '04', name: 'Abril' },
    { value: '05', name: 'Mayo' },
    { value: '06', name: 'Junio' },
    { value: '07', name: 'Julio' },
    { value: '08', name: 'Agosto' },
    { value: '09', name: 'Septiembre' },
    { value: '10', name: 'Octubre' },
    { value: '11', name: 'Noviembre' },
    { value: '12', name: 'Diciembre' },
  ];

  // Years option range from 2024 to 2030
  const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Parse price and option from description
  const parseWashDetails = (description: string): ParsedWash => {
    const match = description.match(/\[Lavado\s+(.*?)\s*-\s*\$([0-9.]+)\s*COP\]/);
    if (match) {
      const label = match[1].trim();
      const priceStr = match[2].replace(/\./g, '');
      const price = parseInt(priceStr, 10) || 0;
      return { label, price };
    }
    
    // Fallback detection based on common keywords
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('15.000') || lowerDesc.includes('15000') || lowerDesc.includes('solo')) {
      return { label: 'Solo Lavado (Manual)', price: 15000 };
    }
    if (lowerDesc.includes('20.000') || lowerDesc.includes('20000') || lowerDesc.includes('desengrasado')) {
      return { label: 'Desengrasado y brillada (Manual)', price: 20000 };
    }
    if (lowerDesc.includes('30.000') || lowerDesc.includes('30000')) {
      return { label: 'Desmanchada motor / Quitado vestido (Manual)', price: 30000 };
    }
    if (lowerDesc.includes('40.000') || lowerDesc.includes('40000')) {
      return { label: 'Desmanchada y quitado vestido (Manual)', price: 40000 };
    }
    if (lowerDesc.includes('70.000') || lowerDesc.includes('70000') || lowerDesc.includes('full')) {
      return { label: 'Servicio Full Premium (Manual)', price: 70000 };
    }

    return {
      label: 'Lavado General',
      price: 15000 // default fallback
    };
  };

  // Filter: wash service only & completed status
  const washAppointments = appointments.filter(a => a.service_type === 'lavado' && a.status === 'completado');

  // Filter by selected month and year
  const monthlyAppointments = washAppointments.filter(appt => {
    if (!appt.date) return false;
    const parts = appt.date.split('-');
    if (parts.length !== 3) return false;
    const year = parts[0];
    const month = parts[1];
    return year === selectedYear && month === selectedMonth;
  });

  // Apply search query
  const filteredAppointments = monthlyAppointments.filter(appt => {
    const query = search.toLowerCase();
    return (
      appt.client_name.toLowerCase().includes(query) ||
      appt.motorcycle_plate.toLowerCase().includes(query) ||
      appt.motorcycle_model.toLowerCase().includes(query)
    );
  });

  // Calculate metrics
  const totalMotos = monthlyAppointments.length;
  
  // Calculate total revenue and build the breakdown map
  let totalRevenue = 0;
  const breakdown: Record<number, number> = {};

  monthlyAppointments.forEach(appt => {
    const { price } = parseWashDetails(appt.description);
    totalRevenue += price;
    breakdown[price] = (breakdown[price] || 0) + 1;
  });

  // Format number to currency format (thousands separator dot)
  const formatCOP = (val: number): string => {
    return '$' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' COP';
  };

  // Open/Close detail modal
  const openDetails = (appt: Appointment) => setSelectedAppt(appt);
  const closeDetails = () => setSelectedAppt(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Historial de Lavados</h2>
          <p>Consulta el historial de motos lavadas, ingresos mensuales y estadísticas de facturación.</p>
        </div>
        <button 
          onClick={fetchAppointments} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Cargando...' : 'Actualizar Datos'}
        </button>
      </div>

      {/* Selectores y Búsqueda */}
      <div 
        className="card" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          padding: '20px 24px', 
          marginBottom: '24px' 
        }}
      >
        <div className="form-group" style={{ margin: 0 }}>
          <label htmlFor="month-select" style={{ marginBottom: '6px' }}>Seleccionar Mes</label>
          <select 
            id="month-select"
            className="form-control" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label htmlFor="year-select" style={{ marginBottom: '6px' }}>Seleccionar Año</label>
          <select 
            id="year-select"
            className="form-control" 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <label htmlFor="search-input" style={{ marginBottom: '6px' }}>Buscar en el mes</label>
          <div style={{ position: 'relative' }}>
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
              id="search-input"
              type="text" 
              className="form-control" 
              placeholder="Cliente, placa o modelo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '46px' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Cargando registros del historial...</p>
      ) : (
        <>
          {/* Métricas Principales */}
          <div className="metrics-grid">
            {/* Total Lavadas */}
            <div className="metric-card">
              <div className="metric-info">
                <h4>Motos Lavadas</h4>
                <div className="value">{totalMotos}</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  En {months.find(m => m.value === selectedMonth)?.name} del {selectedYear}
                </p>
              </div>
              <div className="metric-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--color-info)', borderColor: 'rgba(59, 130, 246, 0.15)' }}>
                <Droplet size={24} />
              </div>
            </div>

            {/* Total Recaudado */}
            <div className="metric-card" style={{ flex: 1.5 }}>
              <div className="metric-info">
                <h4>Total Recaudado</h4>
                <div className="value" style={{ color: 'var(--color-success)', background: 'none', WebkitTextFillColor: 'initial' }}>
                  {formatCOP(totalRevenue)}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Ingresos totales por servicio de lavado
                </p>
              </div>
              <div className="metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
                <DollarSign size={24} />
              </div>
            </div>

            {/* Ticket Promedio */}
            <div className="metric-card">
              <div className="metric-info">
                <h4>Promedio por Moto</h4>
                <div className="value" style={{ fontSize: '24px', paddingTop: '6px' }}>
                  {totalMotos > 0 ? formatCOP(Math.round(totalRevenue / totalMotos)) : '$0 COP'}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Valor promedio de lavados
                </p>
              </div>
              <div className="metric-icon" style={{ backgroundColor: 'rgba(255, 122, 0, 0.08)', color: 'var(--color-accent)', borderColor: 'rgba(255, 122, 0, 0.15)' }}>
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr', gap: '24px', alignItems: 'flex-start' }}>
            
            {/* Tabla de Registros */}
            <div className="card" style={{ margin: 0 }}>
              <div className="card-title">
                <Clock size={20} style={{ color: 'var(--color-accent)' }} />
                <span>Registros de Lavados ({filteredAppointments.length})</span>
              </div>

              {filteredAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No se encontraron motos lavadas para los filtros seleccionados.
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Moto / Placa</th>
                        <th>Tipo de Lavado</th>
                        <th>Valor</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appt) => {
                        const { label, price } = parseWashDetails(appt.description);
                        return (
                          <tr key={appt.id}>
                            <td style={{ fontSize: '13px', fontWeight: '500' }}>
                              {appt.date}
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{appt.time}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: '600' }}>{appt.client_name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{appt.client_phone}</div>
                            </td>
                            <td>
                              <div>{appt.motorcycle_model}</div>
                              <div style={{ fontSize: '12px', color: 'var(--color-info)', fontWeight: '700' }}>
                                {appt.motorcycle_plate.toUpperCase()}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{label}</span>
                            </td>
                            <td style={{ fontWeight: '700', color: 'var(--color-success)' }}>
                              {formatCOP(price)}
                            </td>
                            <td>
                              <button 
                                onClick={() => openDetails(appt)} 
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                Ver Detalle
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Desglose de Recaudación (Breakdown) */}
            <div className="card" style={{ margin: 0 }}>
              <div className="card-title">
                <Layers size={20} style={{ color: 'var(--color-info)' }} />
                <span>Desglose del Mes</span>
              </div>

              {totalMotos === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Sin datos de recaudación en este mes.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Resumen detallado de la cantidad de servicios clasificados por precio de lavado:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.keys(breakdown)
                      .map(Number)
                      .sort((a, b) => a - b)
                      .map((price) => {
                        const count = breakdown[price];
                        const subtotal = count * price;
                        return (
                          <div 
                            key={price}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 16px',
                              backgroundColor: 'rgba(255, 255, 255, 0.01)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              transition: 'var(--transition-smooth)'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {count} {count === 1 ? 'moto' : 'motos'}
                              </div>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Valor unitario: {formatCOP(price)}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-success)' }}>
                                {formatCOP(subtotal)}
                              </div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Subtotal
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Fila del total al final */}
                  <div 
                    style={{
                      marginTop: '8px',
                      padding: '16px',
                      background: 'rgba(255, 122, 0, 0.05)',
                      border: '1px solid rgba(255, 122, 0, 0.15)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Total Lavadas
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {totalMotos} Motos Lavadas
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-success)' }}>
                        {formatCOP(totalRevenue)}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        SUMA TOTAL DEL MES
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* Modal de Detalle */}
      {selectedAppt && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <FileText size={20} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Detalle de Cita de Lavadero</h3>
            </div>
            
            <div style={{ display: 'grid', gap: '12px', fontSize: '15px' }}>
              <p><strong>Cliente:</strong> {selectedAppt.client_name}</p>
              <p><strong>Teléfono:</strong> {selectedAppt.client_phone}</p>
              <p><strong>Placa de Moto:</strong> <span style={{ color: 'var(--color-info)', fontWeight: '700' }}>{selectedAppt.motorcycle_plate.toUpperCase()}</span></p>
              <p><strong>Modelo:</strong> {selectedAppt.motorcycle_model}</p>
              <p><strong>Fecha del Servicio:</strong> {formatDateLegible(selectedAppt.date)}</p>
              <p><strong>Hora de la Cita:</strong> {selectedAppt.time}</p>
              <p><strong>Descripción original / Notas:</strong></p>
              <div 
                style={{ 
                  padding: '12px', 
                  backgroundColor: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '14px',
                  fontStyle: 'italic',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.5'
                }}
              >
                {selectedAppt.description}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={closeDetails} className="btn btn-secondary">Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
