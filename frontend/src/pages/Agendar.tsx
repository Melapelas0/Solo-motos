import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Tag, Wrench, Droplet, FileText, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { appointmentService } from '../services/appointmentService';
import { normalizePlate } from '../lib/workshop';
import { AppointmentCreate } from '../types/appointment';

export const Agendar: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AppointmentCreate>({
    client_name: '',
    client_phone: '',
    motorcycle_plate: '',
    motorcycle_model: '',
    service_type: 'mecanica',
    description: '',
    date: '',
    time: '',
  });

  const [washOption, setWashOption] = useState<'solo' | 'desengrasado' | 'desmanchada_motor_campana' | 'quitado_todo' | 'desmanchada_y_quitado' | 'full'>('solo');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [error, setError] = useState('');

  // Slots de lavadero (intervalos de 1 hora)
  const WASH_TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Slots de mecánica (cada hora de 8 AM a 6 PM)
  const MECHANIC_TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Fecha mínima permitida: hoy (evita seleccionar días pasados)
  const todayStr = new Date().toISOString().split('T')[0];

  // Devuelve true si un slot HH:MM ya pasó siendo hoy la fecha seleccionada
  const isSlotInPast = (slot: string): boolean => {
    if (formData.date !== todayStr) return false;
    const now = new Date();
    const [slotH, slotM] = slot.split(':').map(Number);
    const slotMinutes = slotH * 60 + slotM;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slotMinutes <= nowMinutes;
  };

  // Efecto para consultar las horas ya ocupadas en el día y servicio seleccionado
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.date) {
        setBookedSlots([]);
        return;
      }
      try {
        const taken = await appointmentService.getBookedSlots(formData.date, formData.service_type);
        setBookedSlots(taken);
      } catch (err) {
        console.error('Error al consultar slots ocupados:', err);
      }
    };
    fetchBookedSlots();
  }, [formData.date, formData.service_type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'motorcycle_plate' ? normalizePlate(value) : value,
    }));
  };

  const handleSelectService = (type: 'mecanica' | 'lavado') => {
    setFormData((prev) => ({
      ...prev,
      service_type: type,
      time: '', // Limpiar hora al cambiar tipo de servicio
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.time) {
      setError('Por favor, selecciona una hora para tu cita.');
      return;
    }

    setIsSubmitting(true);

    let finalDescription = formData.description;
    if (formData.service_type === 'lavado') {
      const priceMap: Record<string, string> = {
          solo: '15.000',
          desengrasado: '20.000',
          desmanchada_motor_campana: '30.000',
          quitado_todo: '30.000',
          desmanchada_y_quitado: '40.000',
          full: '70.000'
        };
        const labelMap: Record<string, string> = {
          solo: 'Solo Lavado',
          desengrasado: 'Desengrasado de kit de arrastre, motor y brillada',
          desmanchada_motor_campana: 'Desmanchada de motor y campana',
          quitado_todo: 'Se le quita todo el vestido y la tapa piñón',
          desmanchada_y_quitado: 'Desmanchada de motor y se le quita el vestido',
          full: 'Sin tapas, desmanchada de motor, kit de arrastre, grafiteado chasis, brillada y restauración partes negras'
        };
        const price = priceMap[washOption];
        const label = labelMap[washOption];
        finalDescription = `[Lavado ${label} - $${price} COP] - ${formData.description}`;
    }

    try {
      const result = await appointmentService.create({
        ...formData,
        motorcycle_plate: normalizePlate(formData.motorcycle_plate),
        description: finalDescription
      });
      setSubmittedData(result);
      // Limpiar formulario
      setFormData({
        client_name: '',
        client_phone: '',
        motorcycle_plate: '',
        motorcycle_model: '',
        service_type: 'mecanica',
        description: '',
        date: '',
        time: '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al agendar la cita. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear hora de 24h a 12h legible
  const formatTime12h = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 === 0 ? 12 : h % 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  if (submittedData) {
    return (
      <div className="public-container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', textAlign: 'center', padding: '40px' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--color-success)', margin: '0 auto 24px auto' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>¡Cita Agendada Exitosamente!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Tu solicitud ha sido registrada en nuestro taller. Te esperamos en la fecha y hora seleccionada.
          </p>

          <div 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: '24px',
              textAlign: 'left',
              marginBottom: '32px'
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Resumen de la Cita
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px' }}>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Cliente:</strong> {submittedData.client_name}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Teléfono:</strong> {submittedData.client_phone}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Moto:</strong> {submittedData.motorcycle_model} ({submittedData.motorcycle_plate.toUpperCase()})</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Servicio:</strong> {submittedData.service_type === 'mecanica' ? 'Mantenimiento / Mecánica' : 'Servicio de Lavadero'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Fecha:</strong> {submittedData.date}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Hora:</strong> {formatTime12h(submittedData.time)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => setSubmittedData(null)} className="btn btn-secondary">
              Agendar Otra Cita
            </button>
            <Link to="/" className="btn btn-primary">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-container" style={{ marginTop: '40px' }}>
      <div className="public-header" style={{ marginBottom: '32px' }}>
        <Wrench size={48} style={{ color: 'var(--color-accent)', marginBottom: '16px' }} />
        <h1>SoloMotos</h1>
        <p>Agenda tu servicio mecánico o lavado premium de forma rápida y online</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Formulario de Reserva</h2>
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '14px', 
              color: 'var(--color-accent)',
              fontWeight: '600'
            }}
          >
            <ChevronLeft size={16} /> Volver al Inicio
          </Link>
        </div>

        {error && (
          <div 
            style={{ 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--color-danger-bg)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--color-danger)',
              fontSize: '14px',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Selector de tipo de servicio */}
          <div className="form-group">
            <label>Tipo de Servicio</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
              <div 
                onClick={() => handleSelectService('mecanica')}
                style={{
                  border: formData.service_type === 'mecanica' ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                  backgroundColor: formData.service_type === 'mecanica' ? 'rgba(255,122,0,0.06)' : 'rgba(255,255,255,0.01)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Wrench size={32} style={{ color: formData.service_type === 'mecanica' ? 'var(--color-accent)' : 'var(--text-muted)', marginBottom: '8px' }} />
                <h4 style={{ fontWeight: '700', fontSize: '16px' }}>Mecánica</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Mantenimiento, frenos, motor y más</p>
              </div>

              <div 
                onClick={() => handleSelectService('lavado')}
                style={{
                  border: formData.service_type === 'lavado' ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                  backgroundColor: formData.service_type === 'lavado' ? 'rgba(255,122,0,0.06)' : 'rgba(255,255,255,0.01)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Droplet size={32} style={{ color: formData.service_type === 'lavado' ? 'var(--color-accent)' : 'var(--text-muted)', marginBottom: '8px' }} />
                <h4 style={{ fontWeight: '700', fontSize: '16px' }}>Lavadero</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Lavado general, premium o polichado</p>
              </div>
            </div>
          </div>

          {/* Sección de Selección de Tipo de Lavado */}
          {formData.service_type === 'lavado' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <label>Selecciona tu Tipo de Lavado</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
                
                {/* Solo Lavado */}
                <div 
                  onClick={() => setWashOption('solo')}
                  style={{
                    border: washOption === 'solo' ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                    backgroundColor: washOption === 'solo' ? 'rgba(255,122,0,0.04)' : 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <h5 style={{ fontWeight: '700', fontSize: '14px', color: washOption === 'solo' ? 'var(--color-accent)' : 'var(--text-primary)' }}>Solo Lavado</h5>
                  <div style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0', color: 'var(--color-success)' }}>$15.000 COP</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Champú y secado rápido a presión</p>
                </div>
                {/* Desengrasado */}
                <div 
                  onClick={() => setWashOption('desengrasado')}
                  style={{
                    border: washOption === 'desengrasado' ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                    backgroundColor: washOption === 'desengrasado' ? 'rgba(255,122,0,0.04)' : 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <h5 style={{ fontWeight: '700', fontSize: '14px', color: washOption === 'desengrasado' ? 'var(--color-accent)' : 'var(--text-primary)' }}>Desengrasado de kit de arrastre, motor y brillada</h5>
                  <div style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0', color: 'var(--color-success)' }}>$20.000 COP</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Limpieza profunda de motor y componentes</p>
                </div>
                {/* Desmanchada Motor y Campana */}
                <div 
                  onClick={() => setWashOption('desmanchada_motor_campana')}
                  style={{
                    border: washOption === 'desmanchada_motor_campana' ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                    backgroundColor: washOption === 'desmanchada_motor_campana' ? 'rgba(255,122,0,0.04)' : 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <h5 style={{ fontWeight: '700', fontSize: '14px', color: washOption === 'desmanchada_motor_campana' ? 'var(--color-accent)' : 'var(--text-primary)' }}>Desmanchada de motor y campana</h5>
                  <div style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0', color: 'var(--color-success)' }}>$30.000 COP</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Limpieza y desmanchado de motor y campana</p>
                </div>
                {/* Quitado de todo y tapa piñón */}
                <div 
                  onClick={() => setWashOption('quitado_todo')}
                  style={{
                    border: washOption === 'quitado_todo' ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                    backgroundColor: washOption === 'quitado_todo' ? 'rgba(255,122,0,0.04)' : 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <h5 style={{ fontWeight: '700', fontSize: '14px', color: washOption === 'quitado_todo' ? 'var(--color-accent)' : 'var(--text-primary)' }}>Se le quita todo el vestido y la tapa piñón</h5>
                  <div style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0', color: 'var(--color-success)' }}>$30.000 COP</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Desmontaje completo y limpieza exhaustiva</p>
                </div>
                {/* Desmanchada y quitado del vestido */}
                <div 
                  onClick={() => setWashOption('desmanchada_y_quitado')}
                  style={{
                    border: washOption === 'desmanchada_y_quitado' ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                    backgroundColor: washOption === 'desmanchada_y_quitado' ? 'rgba(255,122,0,0.04)' : 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <h5 style={{ fontWeight: '700', fontSize: '14px', color: washOption === 'desmanchada_y_quitado' ? 'var(--color-accent)' : 'var(--text-primary)' }}>Desmanchada de motor y se le quita el vestido</h5>
                  <div style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0', color: 'var(--color-success)' }}>$40.000 COP</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Limpieza profunda y retiro de vestimenta</p>
                </div>
                {/* Full Premium */}
                <div 
                  onClick={() => setWashOption('full')}
                  style={{
                    border: washOption === 'full' ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                    backgroundColor: washOption === 'full' ? 'rgba(255,122,0,0.04)' : 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <h5 style={{ fontWeight: '700', fontSize: '14px', color: washOption === 'full' ? 'var(--color-accent)' : 'var(--text-primary)' }}>Sin tapas, desmanchada de motor, kit de arrastre, grafiteado chasis, brillada y restauración partes negras</h5>
                  <div style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0', color: 'var(--color-success)' }}>$70.000 COP</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Servicio premium completo con restauración total</p>
                </div>
              </div>
            </div>
          )}

          {/* Datos Personales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="client_name">Tu Nombre Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="client_name"
                  name="client_name"
                  type="text" 
                  className="form-control" 
                  placeholder="Ej. Juan Pérez"
                  value={formData.client_name}
                  onChange={handleChange}
                  style={{ paddingLeft: '46px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="client_phone">Celular de Contacto</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="client_phone"
                  name="client_phone"
                  type="tel" 
                  className="form-control" 
                  placeholder="Ej. 3123456789"
                  value={formData.client_phone}
                  onChange={handleChange}
                  style={{ paddingLeft: '46px' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Datos de la Motocicleta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="motorcycle_model">Modelo de Moto</label>
              <div style={{ position: 'relative' }}>
                <Wrench size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="motorcycle_model"
                  name="motorcycle_model"
                  type="text" 
                  className="form-control" 
                  placeholder="Ej. Yamaha MT-03"
                  value={formData.motorcycle_model}
                  onChange={handleChange}
                  style={{ paddingLeft: '46px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="motorcycle_plate">Placa</label>
              <div style={{ position: 'relative' }}>
                <Tag size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="motorcycle_plate"
                  name="motorcycle_plate"
                  type="text" 
                  className="form-control" 
                  placeholder="Ej. ABC12E"
                  value={formData.motorcycle_plate}
                  onChange={handleChange}
                  style={{ paddingLeft: '46px', textTransform: 'uppercase' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Fecha de Cita */}
          <div className="form-group">
            <label htmlFor="date">Fecha de Cita</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="date"
                name="date"
                type="date"
                className="form-control"
                value={formData.date}
                min={todayStr}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, date: e.target.value, time: '' }));
                }}
                style={{ paddingLeft: '46px' }}
                required
              />
            </div>
          </div>

          {/* Selector de Horas — aplica a AMBOS servicios */}
          <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-out', marginBottom: '24px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} />
                {formData.service_type === 'lavado'
                  ? 'Selecciona una Hora Disponible (Intervalos de 1 hora)'
                  : 'Selecciona una Hora Disponible (Cada hora)'}
              </span>
              {!formData.date && (
                <span style={{ color: 'var(--color-warning)', fontSize: '12px' }}>* Primero selecciona una fecha</span>
              )}
            </label>

            {formData.date ? (() => {
              const slots = formData.service_type === 'lavado' ? WASH_TIME_SLOTS : MECHANIC_TIME_SLOTS;
              // Para hoy: ocultar slots ya pasados
              const visibleSlots = slots.filter(s => !isSlotInPast(s));

              if (visibleSlots.length === 0) {
                return (
                  <div style={{
                    padding: '16px', textAlign: 'center',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px'
                  }}>
                    No hay horarios disponibles para hoy. Por favor selecciona una fecha futura.
                  </div>
                );
              }

              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '10px', marginTop: '8px'
                }}>
                  {visibleSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = formData.time === slot;
                    const isDisabled = isBooked;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setFormData(prev => ({ ...prev, time: slot }))}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition: 'var(--transition-smooth)',
                          border: isSelected
                            ? '2px solid var(--color-accent)'
                            : isBooked
                              ? '1px solid rgba(239,68,68,0.25)'
                              : '1px solid var(--border-color)',
                          backgroundColor: isBooked
                            ? 'rgba(239, 68, 68, 0.05)'
                            : isSelected
                              ? 'rgba(255, 122, 0, 0.15)'
                              : 'rgba(255,255,255,0.02)',
                          color: isBooked
                            ? 'var(--text-muted)'
                            : isSelected
                              ? 'var(--color-accent)'
                              : 'var(--text-primary)',
                          textDecoration: isBooked ? 'line-through' : 'none',
                          boxShadow: isSelected ? 'var(--accent-glow)' : 'none',
                        }}
                      >
                        {formatTime12h(slot)}
                        {isBooked && (
                          <div style={{
                            fontSize: '9px', fontWeight: '800',
                            color: 'var(--color-danger)',
                            textDecoration: 'none', marginTop: '2px'
                          }}>
                            OCUPADO
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })() : (
              <div style={{
                padding: '16px', textAlign: 'center',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px'
              }}>
                Selecciona una fecha de cita para consultar las horas disponibles.
              </div>
            )}
          </div>

          {/* Detalles o Síntomas */}
          <div className="form-group">
            <label htmlFor="description">
              {formData.service_type === 'lavado' 
                ? 'Indicaciones adicionales (Ej: Cuidado especial con sensor de oxígeno, etc.)' 
                : 'Detalles del Servicio / Síntomas'}
            </label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <textarea 
                id="description"
                name="description"
                rows={4} 
                className="form-control" 
                placeholder={formData.service_type === 'lavado'
                  ? "Describe si hay alguna especificación o advertencia para el lavado..."
                  : "Describe qué requiere tu moto o qué síntomas presenta..."}
                value={formData.description}
                onChange={handleChange}
                style={{ paddingLeft: '46px', resize: 'vertical' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', marginTop: '12px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando Cita...' : 'Confirmar y Agendar Cita'}
          </button>
        </form>
      </div>
    </div>
  );
};
