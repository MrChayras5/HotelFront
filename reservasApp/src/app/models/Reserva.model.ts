export interface Reserva {
  id?: number;
  huespedId: number;     // Relación con Huésped
  habitacionId: number;  // Relación con Habitación
  fechaEntrada: string;
  fechaSalida: string;
  total: number;
  estado: 'Confirmada' | 'En curso' | 'Finalizada' | 'Cancelada';
}