import { apiRequest } from './api';
import { Appointment, AppointmentCreate, AppointmentUpdate } from '../types/appointment';

export const appointmentService = {
  /**
   * Obtiene todas las citas
   */
  getAll: async (): Promise<Appointment[]> => {
    return await apiRequest<Appointment[]>('/appointments');
  },

  /**
   * Obtiene los slots de hora ya ocupados para una fecha y tipo de servicio.
   */
  getBookedSlots: async (date: string, serviceType: string): Promise<string[]> => {
    const params = new URLSearchParams({ date, service_type: serviceType });
    return await apiRequest<string[]>(`/appointments/booked-slots?${params}`);
  },

  /**
   * Crea una nueva cita
   */
  create: async (appointment: AppointmentCreate): Promise<Appointment> => {
    return await apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  },

  /**
   * Actualiza el estado o información de una cita
   */
  update: async (id: string, appointment: AppointmentUpdate): Promise<Appointment> => {
    return await apiRequest<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    });
  },

  /**
   * Elimina una cita
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return await apiRequest<{ message: string }>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },
  /**
   * Obtiene el estado de una moto por su placa (público)
   */
  getStatusByPlate: async (plate: string): Promise<Appointment> => {
    return await apiRequest<Appointment>(`/appointments/status/${plate}`);
  },
};
