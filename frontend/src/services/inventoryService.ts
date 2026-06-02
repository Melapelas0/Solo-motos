import { apiRequest } from './api';
import { Item, ItemCreate, ItemUpdate } from '../types/item';

export const inventoryService = {
  /**
   * Obtiene todos los repuestos/items del inventario
   */
  getAll: async (): Promise<Item[]> => {
    return apiRequest<Item[]>('/items');
  },

  /**
   * Agrega un nuevo repuesto al inventario
   */
  create: async (item: ItemCreate): Promise<Item> => {
    return apiRequest<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  /**
   * Actualiza los datos de un repuesto existente
   */
  update: async (id: string, item: ItemUpdate): Promise<Item> => {
    return apiRequest<Item>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  /**
   * Elimina un repuesto del inventario
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};
