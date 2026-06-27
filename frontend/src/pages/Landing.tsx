import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Droplet, Clock, ShieldCheck, ChevronRight, User, Search } from 'lucide-react';
import { appointmentService } from '../services/appointmentService';
import { normalizePlate } from '../lib/workshop';
// Imagen reemplazada por gradiente CSS para evitar dependencia de archivo

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [plateInput, setPlateInput] = useState('');
  const [statusResult, setStatusResult] = useState<any>(null);
  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const handleSearch = async () => {
    const normalizedPlate = normalizePlate(plateInput);
    if (!normalizedPlate) return;
    setStatusLoading(true);
    setStatusError('');
    setStatusResult(null);
    try {
      const result = await appointmentService.getStatusByPlate(normalizedPlate);
      setStatusResult(result);
    } catch (err) {
      setStatusError('No se encontró ninguna cita activa para esa placa.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0b0e' }}>
      
      {/* Header / Navbar */}
      <header 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '80px', 
          backgroundColor: 'rgba(10, 11, 14, 0.8)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0 40px',
          zIndex: 1000 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(255, 122, 0, 0.15)', 
              border: '1px solid var(--color-accent)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Wrench size={20} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1 
            style={{ 
              fontSize: '22px', 
              fontWeight: '900', 
              letterSpacing: '-0.5px', 
              background: 'var(--accent-gradient)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              textTransform: 'uppercase' 
            }}
          >
            SoloMotos
          </h1>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link 
            to="/login" 
            style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              color: 'var(--text-secondary)',
              transition: 'var(--transition-smooth)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="hover-accent"
          >
            <User size={16} />
            Acceso Admin
          </Link>
          <button 
            onClick={() => navigate('/agendar')} 
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            Agendar Cita
            <ChevronRight size={16} />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section 
        style={{ 
          position: 'relative', 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '120px 40px 80px 40px',
          // Gradiente de fondo sin depender de imagen que no existe
          background: 'linear-gradient(135deg, #0a0b0e 0%, #1a1d2e 50%, #2d1f1a 100%)',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '680px', zIndex: 10 }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 14px', 
              borderRadius: '99px', 
              backgroundColor: 'rgba(255, 122, 0, 0.1)', 
              border: '1px solid rgba(255, 122, 0, 0.2)',
              color: 'var(--color-accent)',
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '24px'
            }}
          >
            <ShieldCheck size={14} />
            Taller Autorizado Premium
          </div>
          
          <h2 
            style={{ 
              fontSize: '64px', 
              fontWeight: '900', 
              lineHeight: '1.1', 
              letterSpacing: '-2px',
              marginBottom: '20px' 
            }}
          >
            Cuidado y Potencia para tu <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Motocicleta</span>
          </h2>
          
          <p 
            style={{ 
              fontSize: '18px', 
              lineHeight: '1.6', 
              color: 'var(--text-secondary)', 
              marginBottom: '40px' 
            }}
          >
            Servicio de mecánica especializada de alta gama y centro de estética de vehículos avanzado. Conecta con expertos que cuidan cada detalle técnico y estético de tu moto.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/agendar')} 
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '16px' }}
            >
              Agendar Cita Ahora
              <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => setShowStatusModal(true)} 
              className="btn btn-secondary"
              style={{ padding: '14px 32px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Search size={18} />
              Consultar Estado
            </button>
          </div>
        </div>

        {/* Glow effect */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '-10%', 
            left: '-5%', 
            width: '400px', 
            height: '400px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(255, 122, 0, 0.15)', 
            filter: 'blur(100px)',
            pointerEvents: 'none'
          }} 
        />
      </section>

      {/* Services Section */}
      <section 
        id="servicios"
        style={{ 
          padding: '100px 40px', 
          backgroundColor: '#0c0d12', 
          backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255, 122, 0, 0.02) 0%, transparent 50%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.03)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h3 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px' }}>Nuestros Servicios de Especialidad</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              Ofrecemos soluciones integrales y profesionales diseñadas específicamente para motocicletas de todos los cilindrajes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
            
            {/* Card 1: Mecánica */}
            <div 
              style={{ 
                backgroundColor: '#12141c', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '40px',
                transition: 'var(--transition-smooth)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="service-card-hover"
            >
              <div 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(255, 122, 0, 0.1)', 
                  border: '1px solid rgba(255, 122, 0, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--color-accent)',
                  marginBottom: '28px' 
                }}
              >
                <Wrench size={24} />
              </div>
              <h4 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '16px' }}>Mantenimiento & Mecánica</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px', marginBottom: '24px' }}>
                Diagnóstico de fallas por computadora, sincronización del motor, mantención de frenos, suspensión y sistemas de transmisión de alta cilindrada.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: '700' }}>✓</span> Técnicos certificados y especializados
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: '700' }}>✓</span> Repuestos originales garantizados
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: '700' }}>✓</span> Equipos de diagnóstico avanzados
                </li>
              </ul>
            </div>

            {/* Card 2: Estética/Lavadero */}
            <div 
              style={{ 
                backgroundColor: '#12141c', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '40px',
                transition: 'var(--transition-smooth)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="service-card-hover"
            >
              <div 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(255, 122, 0, 0.1)', 
                  border: '1px solid rgba(255, 122, 0, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--color-accent)',
                  marginBottom: '28px' 
                }}
              >
                <Droplet size={24} />
              </div>
              <h4 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '16px' }}>Estética & Lavadero Premium</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px', marginBottom: '24px' }}>
                Tratamientos de lavado especializado a presión, detallado profundo y polichado premium. Protección para plásticos, motor y chasis.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: '700' }}>✓</span> Lavados desde 15,000 COP
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: '700' }}>✓</span> Intervalos de 1 hora sin retrasos
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: '700' }}>✓</span> Productos biodegradables de calidad
                </li>
              </ul>
            </div>

          </div>

          {/* Quick info banner */}
          <div 
            style={{ 
              marginTop: '80px', 
              padding: '32px 40px', 
              borderRadius: 'var(--radius-lg)', 
              backgroundColor: 'rgba(255, 122, 0, 0.03)', 
              border: '1px solid rgba(255, 122, 0, 0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Clock size={32} style={{ color: 'var(--color-accent)' }} />
              <div>
                <h5 style={{ fontSize: '18px', fontWeight: '700' }}>Horario de Atención del Taller</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px' }}>Lunes a Sábado: 8:00 AM - 6:00 PM</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/agendar')} 
              className="btn btn-primary"
              style={{ padding: '12px 28px' }}
            >
              Reservar Cupo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        style={{ 
          marginTop: 'auto', 
          backgroundColor: '#07080b', 
          borderTop: '1px solid rgba(255, 255, 255, 0.03)', 
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '14px' 
        }}
      >
        <p>© 2026 SoloMotos. Todos los derechos reservados. Diseñado para un rendimiento extremo.</p>
      </footer>

      {/* Modal Consultar Estado por Placa */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => { setShowStatusModal(false); setStatusResult(null); setStatusError(''); setPlateInput(''); }}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #1a1d2e, #12141c)',
              border: '1px solid rgba(255, 122, 0, 0.15)',
              color: '#fff',
              maxWidth: '440px',
              padding: '32px',
              borderRadius: '16px'
            }}
          >
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Consultar Estado de tu Moto
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Ingresa la placa de tu motocicleta para ver el estado de tu servicio.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Ej: ABC123"
                value={plateInput}
                onChange={e => setPlateInput(normalizePlate(e.target.value))}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  outline: 'none'
                }}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleSearch}
                disabled={statusLoading}
                style={{ padding: '12px 20px' }}
              >
                {statusLoading ? '...' : 'Buscar'}
              </button>
            </div>

            {statusError && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '14px', marginBottom: '12px' }}>
                {statusError}
              </div>
            )}

            {statusResult && (
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Placa</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-accent)', fontSize: '16px', letterSpacing: '1px' }}>{statusResult.motorcycle_plate?.toUpperCase()}</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Cliente</span>
                    <span style={{ fontWeight: '600' }}>{statusResult.client_name}</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Servicio</span>
                    <span style={{ fontWeight: '600', color: statusResult.service_type === 'mecanica' ? 'var(--color-accent)' : 'var(--color-info)' }}>
                      {statusResult.service_type === 'mecanica' ? '🔧 Mecánica' : '💧 Lavado'}
                    </span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Estado</span>
                    <span style={{
                      fontWeight: '700',
                      padding: '4px 12px',
                      borderRadius: '99px',
                      fontSize: '13px',
                      backgroundColor: statusResult.status === 'completado' ? 'rgba(16,185,129,0.15)' : statusResult.status === 'en_progreso' ? 'rgba(59,130,246,0.15)' : 'rgba(255,122,0,0.15)',
                      color: statusResult.status === 'completado' ? '#34d399' : statusResult.status === 'en_progreso' ? '#60a5fa' : '#ff7a00'
                    }}>
                      {statusResult.status === 'completado' ? '✅ Completado' : statusResult.status === 'en_progreso' ? '🔄 En Progreso' : statusResult.status === 'pendiente' ? '⏳ Pendiente' : statusResult.status}
                    </span>
                  </div>
                  {statusResult.date && (
                    <>
                      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Fecha</span>
                        <span style={{ fontWeight: '600' }}>{statusResult.date}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => { setShowStatusModal(false); setStatusResult(null); setStatusError(''); setPlateInput(''); }}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'var(--transition-smooth)'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
