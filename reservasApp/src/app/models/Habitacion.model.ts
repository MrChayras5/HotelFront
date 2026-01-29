

// DTO para enviar al backend (Crear/Editar) 
export interface HabitacionRequest {
  numero: number;
  tipo: string;
  precio: number;
  capacidad: number;
  estado: 'Disponible' | 'Ocupada' | 'Limpieza' | 'Mantenimiento';
}

// DTO que recibimos del backend 
export interface HabitacionResponse {
  id: number;
  numero: number;
  tipo: string;
  precio: number;
  capacidad: number;
  estado: 'Disponible' | 'Ocupada' | 'Limpieza' | 'Mantenimiento';
}