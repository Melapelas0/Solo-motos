export type ServiceType = 'mecanica' | 'lavado';
export type AppointmentStatus = 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  motorcycle_plate: string;
  motorcycle_model: string;
  service_type: ServiceType;
  description: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface AppointmentCreate {
  client_name: string;
  client_phone: string;
  motorcycle_plate: string;
  motorcycle_model: string;
  service_type: ServiceType;
  description: string;
  date: string;
  time: string;
}

export interface AppointmentUpdate {
  client_name?: string;
  client_phone?: string;
  motorcycle_plate?: string;
  motorcycle_model?: string;
  service_type?: ServiceType;
  description?: string;
  date?: string;
  time?: string;
  status?: AppointmentStatus;
}
