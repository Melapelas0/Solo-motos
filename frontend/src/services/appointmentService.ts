import { apiRequest } from './api';
import { Appointment, AppointmentCreate, AppointmentUpdate } from '../types/appointment';

// Seed data para desarrollo local / demostración
const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    client_name: 'Carlos Mendoza',
    client_phone: '3124567890',
    motorcycle_plate: 'KLE45F',
    motorcycle_model: 'Yamaha MT-09',
    service_type: 'mecanica',
    description: 'Cambio de aceite, filtro y pastillas de freno delanteras. Revisión general.',
    date: '2026-05-27',
    time: '09:00',
    status: 'en_progreso',
    created_at: new Date().toISOString(),
  },
  {
    id: 'appt-2',
    client_name: 'Diana Restrepo',
    client_phone: '3157890123',
    motorcycle_plate: 'QWE12G',
    motorcycle_model: 'KTM Duke 390',
    service_type: 'lavado',
    description: 'Lavado Premium + Polichado y lubricación de cadena.',
    date: '2026-05-27',
    time: '10:30',
    status: 'pendiente',
    created_at: new Date().toISOString(),
  },
  {
    id: 'appt-3',
    client_name: 'Mauricio Silva',
    client_phone: '3004561234',
    motorcycle_plate: 'ZXC98E',
    motorcycle_model: 'Suzuki V-Strom 650',
    service_type: 'mecanica',
    description: 'Ajuste de guayas de embrague y acelerador. Tensión de cadena.',
    date: '2026-05-28',
    time: '14:00',
    status: 'pendiente',
    created_at: new Date().toISOString(),
  },
  {
    id: 'appt-4',
    client_name: 'Juan Perez',
    client_phone: '3119876543',
    motorcycle_plate: 'MNB76C',
    motorcycle_model: 'Honda CB 190R',
    service_type: 'lavado',
    description: 'Lavado sencillo completo rápido.',
    date: '2026-05-26',
    time: '08:00',
    status: 'completado',
    created_at: new Date().toISOString(),
  },
];

// Inicializar LocalStorage con datos de semilla si no existen
const getLocalStorageAppointments = (): Appointment[] => {
  const stored = localStorage.getItem('solomotos_appointments');
  if (!stored) {
    localStorage.setItem('solomotos_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
    return DEFAULT_APPOINTMENTS;
  }
  return JSON.parse(stored);
};

const saveLocalStorageAppointments = (appointments: Appointment[]) => {
  localStorage.setItem('solomotos_appointments', JSON.stringify(appointments));
};

export const appointmentService = {
  /**
   * Obtiene todas las citas
   */
  getAll: async (): Promise<Appointment[]> => {
    try {
      return await apiRequest<Appointment[]>('/appointments');
    } catch {
      console.warn('FastAPI /appointments no disponible, usando LocalStorage fallback.');
      return getLocalStorageAppointments();
    }
  },

  /**
   * Obtiene los slots de hora ya ocupados para una fecha y tipo de servicio.
   * Usa el endpoint dedicado del backend; cae en LocalStorage si no está disponible.
   */
  getBookedSlots: async (date: string, serviceType: string): Promise<string[]> => {
    try {
      const params = new URLSearchParams({ date, service_type: serviceType });
      return await apiRequest<string[]>(`/appointments/booked-slots?${params}`);
    } catch {
      console.warn('FastAPI /booked-slots no disponible, usando LocalStorage fallback.');
      const list = getLocalStorageAppointments();
      return list
        .filter(
          (a) =>
            a.date === date &&
            a.service_type === serviceType &&
            a.status !== 'cancelado',
        )
        .map((a) => a.time);
    }
  },

  /**
   * Crea una nueva cita
   */
  create: async (appointment: AppointmentCreate): Promise<Appointment> => {
    try {
      return await apiRequest<Appointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointment),
      });
    } catch {
      console.warn('FastAPI POST /appointments no disponible, usando LocalStorage fallback.');
      const list = getLocalStorageAppointments();
      const newAppt: Appointment = {
        ...appointment,
        id: `appt-${Date.now()}`,
        status: 'pendiente',
        created_at: new Date().toISOString(),
      };
      list.push(newAppt);
      saveLocalStorageAppointments(list);
      return newAppt;
    }
  },

  /**
   * Actualiza el estado o información de una cita
   */
  update: async (id: string, appointment: AppointmentUpdate): Promise<Appointment> => {
    try {
      return await apiRequest<Appointment>(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointment),
      });
    } catch {
      console.warn('FastAPI PUT /appointments no disponible, usando LocalStorage fallback.');
      const list = getLocalStorageAppointments();
      const index = list.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Cita no encontrada');
      
      const updated = {
        ...list[index],
        ...appointment,
      };
      list[index] = updated;
      saveLocalStorageAppointments(list);
      return updated;
    }
  },

  /**
   * Elimina una cita
   */
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      return await apiRequest<{ message: string }>(`/appointments/${id}`, {
        method: 'DELETE',
      });
    } catch {
      console.warn('FastAPI DELETE /appointments no disponible, usando LocalStorage fallback.');
      const list = getLocalStorageAppointments();
      const filtered = list.filter((a) => a.id !== id);
      saveLocalStorageAppointments(filtered);
      return { message: 'Cita eliminada correctamente' };
    }
  },
};
