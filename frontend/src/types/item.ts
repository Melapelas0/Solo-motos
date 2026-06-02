export interface Item {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  max_stock: number;
  unit: string;
  notes?: string;
}

export interface ItemCreate {
  name: string;
  category: string;
  current_stock: number;
  max_stock: number;
  unit: string;
  notes?: string;
}

export interface ItemUpdate {
  name?: string;
  category?: string;
  current_stock?: number;
  max_stock?: number;
  unit?: string;
  notes?: string;
}
