import React, { useState, useEffect } from 'react';
import { Droplet, Play, Check, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { getStatusBadgeClass } from '../../lib/workshop';

export const Lavadero: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener la fecha de hoy en formato YYYY-MM-DD para validación
  const today = new Date().toISOString().split('T')[0];

  const fetchWashList = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAll();
      // Filtrar solo las citas que corresponden a servicio de lavadero
      setAppointments(data.filter(a => a.service_type === 'lavado'));
    } catch (error) {
      console.error('Error fetching wash list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWashList();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentService.update(id, { status: newStatus });
      // Actualizar estado local
      setAppointments(prev => 
        prev.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt)
      );
    } catch (error) {
      alert('Error al actualizar el estado de lavado: ' + error);
    }
  };

  // Filtrar cola activa (Pendiente, En Progreso)
  const activeQueue = appointments.filter(a => a.status === 'pendiente' || a.status === 'en_progreso');
  
  // Filtrar terminadas o canceladas
  const completedQueue = appointments.filter(a => a.status === 'completado' || a.status === 'cancelado');

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Servicio de Lavadero</h2>
          <p>Cola de lavado, control de tiempos e inspección de vehículos listos para entrega.</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Cargando cola de lavado...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
          
          {/* Cola de Lavado Activa */}
          <div>
            <div className="card">
              <div className="card-title">
                <Clock size={20} style={{ color: 'var(--color-info)' }} />
                <span>Cola Activa ({activeQueue.length} Motos)</span>
              </div>

              {activeQueue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No hay motocicletas pendientes de lavado en este momento.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeQueue.map((appt) => (
                    <div 
                      key={appt.id}
                      style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        gap: '16px', 
                        padding: '16px 20px', 
                        backgroundColor: 'rgba(255,255,255,0.01)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '700' }}>{appt.client_name}</span>
                          <span className={`badge ${getStatusBadgeClass(appt.status)}`}>
                            {appt.status === 'pendiente' ? 'Esperando lavado' : 'Lavando...'}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                          Moto: <strong style={{ color: 'var(--text-primary)' }}>{appt.motorcycle_model}</strong> | Fecha: <strong style={{ color: appt.date === today ? 'var(--color-success)' : 'var(--text-primary)' }}>{appt.date}</strong> | Hora programada: <strong style={{ color: 'var(--text-primary)' }}>{appt.time}</strong>
                        </div>
                        
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '400px' }}>
                          Detalles: <span style={{ fontStyle: 'italic' }}>{appt.description}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-info)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {appt.motorcycle_plate.toUpperCase()}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {appt.status === 'pendiente' && (
                            <button 
                              onClick={() => handleUpdateStatus(appt.id, 'en_progreso')}
                              className={`btn ${appt.date === today ? 'btn-primary' : 'btn-secondary'}`}
                              disabled={appt.date !== today}
                              style={{ 
                                padding: '8px 16px', 
                                fontSize: '13px', 
                                background: appt.date === today ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : undefined,
                                boxShadow: appt.date === today ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none',
                                cursor: appt.date === today ? 'pointer' : 'not-allowed',
                                opacity: appt.date === today ? 1 : 0.5
                              }}
                            >
                              <Play size={14} />
                              Iniciar Lavado
                            </button>
                          )}

                          {appt.status === 'en_progreso' && (
                            <button 
                              onClick={() => handleUpdateStatus(appt.id, 'completado')}
                              className="btn btn-primary"
                              style={{ 
                                padding: '8px 16px', 
                                fontSize: '13px', 
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <Check size={14} />
                              Terminado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historial rápido a la derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Garantía de calidad */}
            <div className="card">
              <div className="card-title" style={{ fontSize: '18px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--color-success)' }} />
                <span>Protocolo de Entrega</span>
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.4' }}>
                <li>✓ Secado completo a presión.</li>
                <li>✓ Lubricación de cadena y guayas.</li>
                <li>✓ Silicona protectora de plásticos.</li>
                <li>✓ Calibración de presión de llantas.</li>
              </ul>
            </div>

            {/* Lavadas Recientemente */}
            <div className="card">
              <div className="card-title" style={{ fontSize: '18px' }}>
                <Droplet size={18} style={{ color: 'var(--text-secondary)' }} />
                <span>Historial de Lavado</span>
              </div>

              {completedQueue.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ninguna moto lavada hoy todavía.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {completedQueue.slice(0, 5).map((appt) => (
                    <div 
                      key={appt.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '10px', 
                        backgroundColor: 'rgba(255,255,255,0.01)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600' }}>{appt.client_name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{appt.motorcycle_model}</div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>
                          {appt.motorcycle_plate.toUpperCase()}
                        </div>
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            color: appt.status === 'completado' ? 'var(--color-success)' : 'var(--color-danger)', 
                            fontWeight: '600' 
                          }}
                        >
                          {appt.status === 'completado' ? 'LAVADO ✓' : 'CANCELADO ✗'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
