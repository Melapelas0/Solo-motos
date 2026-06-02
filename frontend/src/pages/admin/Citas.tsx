import React, { useState, useEffect } from 'react';
import { ClipboardList, Play, Check, XCircle, Search, Calendar } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { getStatusLabel, getStatusBadgeClass, getServiceLabel, formatDateLegible } from '../../lib/workshop';

export const Citas: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<AppointmentStatus | 'todos'>('todos');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAll();
      // Filtrar solo las citas que corresponden a servicio de mecánica
      setAppointments(data.filter(a => a.service_type === 'mecanica'));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentService.update(id, { status: newStatus });
      // Actualizar estado local
      setAppointments(prev => 
        prev.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt)
      );
    } catch (error) {
      alert('Error al actualizar el estado: ' + error);
    }
  };

  // Filtrar citas según búsqueda y pestaña activa
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      appt.client_name.toLowerCase().includes(search.toLowerCase()) ||
      appt.motorcycle_plate.toLowerCase().includes(search.toLowerCase()) ||
      appt.motorcycle_model.toLowerCase().includes(search.toLowerCase());
      
    const matchesTab = activeTab === 'todos' || appt.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Gestión de Citas Mecánicas</h2>
          <p>Controla las admisiones de motocicletas al taller, diagnostica estados e inicia reparaciones.</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {(['todos', 'pendiente', 'en_progreso', 'completado', 'cancelado'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: activeTab === tab ? 'var(--color-accent)' : 'rgba(255,255,255,0.03)',
                color: activeTab === tab ? '#white' : 'var(--text-secondary)',
                border: activeTab === tab ? 'none' : '1px solid var(--border-color)',
                boxShadow: activeTab === tab ? 'var(--accent-glow)' : 'none',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'todos' ? 'Todas las Citas' : getStatusLabel(tab)}
            </button>
          ))}
        </div>

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
            placeholder="Buscar por cliente, placa o modelo..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '46px' }}
          />
        </div>
      </div>

      {/* Lista de Citas */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Cargando citas mecánicas...</p>
      ) : filteredAppointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', display: 'inline-block' }} />
          <p>No se encontraron citas mecánicas registradas.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredAppointments.map((appt) => (
            <div 
              key={appt.id} 
              className="card" 
              style={{ 
                margin: 0, 
                borderLeft: appt.status === 'pendiente' 
                  ? '4px solid var(--color-warning)' 
                  : appt.status === 'en_progreso' 
                    ? '4px solid var(--color-info)' 
                    : appt.status === 'completado' 
                      ? '4px solid var(--color-success)' 
                      : '4px solid var(--color-danger)'
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  gap: '16px',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '16px',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{appt.client_name}</h3>
                    <span className={`badge ${getStatusBadgeClass(appt.status)}`}>
                      {getStatusLabel(appt.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Contacto: <strong style={{ color: 'var(--text-primary)' }}>{appt.client_phone}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-accent)', textTransform: 'uppercase' }}>
                    {appt.motorcycle_plate.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {appt.motorcycle_model}
                  </div>
                </div>
              </div>

              {/* Detalles de la cita */}
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Descripción de la falla / Trabajo solicitado:</strong>
                  <p style={{ marginTop: '4px', lineHeight: '1.6', color: 'var(--text-primary)' }}>{appt.description}</p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} style={{ color: 'var(--color-accent)' }} />
                    <span>Fecha: <strong style={{ color: 'var(--text-primary)' }}>{formatDateLegible(appt.date)}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Hora: <strong style={{ color: 'var(--text-primary)' }}>{appt.time}</strong></span>
                  </div>
                </div>
              </div>

              {/* Botones de acción según el estado */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '12px', 
                  marginTop: '20px', 
                  borderTop: '1px solid var(--border-color)', 
                  paddingTop: '16px' 
                }}
              >
                {appt.status === 'pendiente' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(appt.id, 'cancelado')} 
                      className="btn btn-secondary"
                      style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      <XCircle size={16} />
                      Cancelar Cita
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(appt.id, 'en_progreso')} 
                      className="btn btn-primary"
                    >
                      <Play size={16} />
                      Iniciar Mecánica
                    </button>
                  </>
                )}

                {appt.status === 'en_progreso' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(appt.id, 'pendiente')} 
                      className="btn btn-secondary"
                    >
                      Pausar Trabajo
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(appt.id, 'completado')} 
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}
                    >
                      <Check size={16} />
                      Completar y Entregar
                    </button>
                  </>
                )}

                {(appt.status === 'completado' || appt.status === 'cancelado') && (
                  <button 
                    onClick={() => handleUpdateStatus(appt.id, 'pendiente')} 
                    className="btn btn-secondary"
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    Reabrir Cita
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
