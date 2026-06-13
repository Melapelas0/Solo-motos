import { AppointmentStatus, ServiceType } from '../types/appointment';

/**
 * Retorna la clase CSS o color correspondiente al estado de la cita
 */
export const getStatusBadgeClass = (status: AppointmentStatus): string => {
  switch (status) {
    case 'pendiente':
      return 'badge-pending';
    case 'en_progreso':
      return 'badge-progress';
    case 'completado':
      return 'badge-completed';
    case 'cancelado':
      return 'badge-cancelled';
    default:
      return '';
  }
};

/**
 * Traduce el estado a texto legible en español
 */
export const getStatusLabel = (status: AppointmentStatus): string => {
  switch (status) {
    case 'pendiente':
      return 'Pendiente';
    case 'en_progreso':
      return 'En Progreso';
    case 'completado':
      return 'Completado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return status;
  }
};

/**
 * Traduce el tipo de servicio a texto legible en español
 */
export const getServiceLabel = (type: ServiceType): string => {
  switch (type) {
    case 'mecanica':
      return 'Mantenimiento / Mecánica';
    case 'lavado':
      return 'Servicio de Lavadero';
    default:
      return type;
  }
};

/**
 * Formatea una fecha estándar YYYY-MM-DD a formato legible: "24 de Mayo, 2026"
 */
export const formatDateLegible = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return `${parseInt(day, 10)} de ${months[monthIdx]}, ${year}`;
};

/**
 * Valida si una placa de moto es válida en Colombia (ej. ABC12D o ABC123)
 */
export const isValidPlate = (plate: string): boolean => {
  const cleanPlate = plate.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  // Generalmente 3 letras + 2 números + 1 número o letra (ej: ABC12D o ABC123)
  const regex = /^[A-Z]{3}\d{2}[A-Z\d]$/;
  return regex.test(cleanPlate);
};

export const normalizePlate = (plate: string): string => {
  return plate.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
};
