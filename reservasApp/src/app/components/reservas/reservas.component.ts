import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservasService } from '../../services/reservas.service';
import { HabitacionesService } from '../../services/habitaciones.service';
import { HuespedesService } from '../../services/huespedes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html'
})
export class ReservasComponent implements OnInit {
  reservaForm: FormGroup;
  listaReservas: any[] = [];
  habitacionesDisponibles: any[] = [];
  huespedes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private habService: HabitacionesService,
    private huespedService: HuespedesService
  ) {
    this.reservaForm = this.fb.group({
      huespedId: ['', Validators.required],
      habitacionId: ['', Validators.required],
      fechaEntrada: ['', Validators.required],
      fechaSalida: ['', Validators.required],
      total: [{ value: 0, disabled: true }] // Se calcula solo
    });
  }

  ngOnInit() {
    this.cargarDatos();
    // Escuchar cambios en fechas para recalcular precio
    this.reservaForm.valueChanges.subscribe(() => this.calcularCosto());
  }

  cargarDatos() {
    this.reservasService.getReservas().subscribe(data => this.listaReservas = data);
    this.habService.getHabitaciones().subscribe(data => {
      this.habitacionesDisponibles = data.filter(h => h.estado === 'Disponible');
    });
    this.huespedService.getHuespedes().subscribe(data => this.huespedes = data);
  }

  calcularCosto() {
    const { habitacionId, fechaEntrada, fechaSalida } = this.reservaForm.getRawValue();
    if (habitacionId && fechaEntrada && fechaSalida) {
      const hab = this.habitacionesDisponibles.find(h => h.id === +habitacionId);
      const inicio = new Date(fechaEntrada);
      const fin = new Date(fechaSalida);
      
      const dias = (fin.getTime() - inicio.getTime()) / (1000 * 3600 * 24);
      if (dias > 0) {
        const total = dias * hab.precio;
        this.reservaForm.patchValue({ total }, { emitEvent: false });
      }
    }
  }

  guardarReserva() {
    this.reservasService.crearReserva(this.reservaForm.getRawValue()).subscribe(() => {
      Swal.fire('Éxito', 'Reserva creada', 'success');
      this.cargarDatos();
      this.reservaForm.reset();
    });
  }

  /**
 * Verifica si la hora actual es igual o posterior a las 15:00
 * para permitir el Check-in.
 */
puedeRealizarCheckIn(): boolean {
  const ahora = new Date();
  const horaActual = ahora.getHours();
  
  // Retorna true si son las 15:00 (3 PM) o más tarde
  return horaActual >= 15;
}

/**
 * Método para procesar el Check-in
 */
confirmarCheckIn(reserva: any) {
  if (!this.puedeRealizarCheckIn()) {
    Swal.fire('Atención', 'El Check-in solo está disponible después de las 15:00.', 'warning');
    return;
  }

  // Si la hora es correcta, llamamos al servicio
  this.reservasService.actualizarEstado(reserva.id, 'En curso').subscribe({
    next: () => {
      Swal.fire('Check-in Exitoso', 'El huésped ahora está en el hotel.', 'success');
      this.cargarDatos(); // Recargar tabla
    },
    error: (err) => Swal.fire('Error', 'No se pudo procesar el check-in', 'error')
  });
}

/**
 * Finaliza la estadía del huésped.
 * Según el PDF, esto cambia el estado a 'Finalizada'.
 */
procesarCheckOut(reserva: any) {
  Swal.fire({
    title: '¿Confirmar Check-out?',
    text: `Se finalizará la estadía para la habitación ${reserva.habitacionId}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, finalizar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Llamamos al servicio para cambiar el estado a 'Finalizada'
      this.reservasService.actualizarEstado(reserva.id, 'Finalizada').subscribe({
        next: () => {
          Swal.fire('Completado', 'Check-out realizado con éxito. La habitación ahora requiere limpieza.', 'success');
          this.cargarDatos(); // Recarga la tabla para ver los cambios
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo procesar el check-out', 'error');
          console.error(err);
        }
      });
    }
  });
}
}