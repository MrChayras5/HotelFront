import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HabitacionesService } from '../../services/habitaciones.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HabitacionRequest, HabitacionResponse } from '../../models/Habitacion.model';
import { AuthService } from '../../services/auth.service';
import { Roles } from '../../constants/Roles';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-habitaciones',
  standalone: false,
  templateUrl: './habitaciones.component.html',
  styleUrl: './habitaciones.component.css'
})
export class HabitacionesComponent implements OnInit, AfterViewInit{

// Variables para el Modal y Títulos
  modalText: string = 'Registrar Habitación';
  @ViewChild('habitacionModalRef') habitacionModalEl!: ElementRef;
  private modalInstance!: any;
  
  // Variables de Lógica
  habitacionForm: FormGroup;
  listaHabitaciones: HabitacionResponse[] = [];
  
  // Listas estáticas requeridas por el PDF [cite: 9, 133]
  listaTipos: string[] = ['Individual', 'Doble', 'Suite'];
  listaEstados: string[] = ['Disponible', 'Ocupada', 'Limpieza', 'Mantenimiento'];

  // Variables de Estado del Componente
  isEditMode: boolean = false;
  selectedHabitacion: HabitacionResponse | null = null;
  showActions: boolean = false; // Controla si se ven los botones de Admin

  constructor(
    private fb: FormBuilder,
    private habitacionesService: HabitacionesService,
    private authService: AuthService
  ) {
    // Inicialización del Formulario con Validaciones del PDF
    this.habitacionForm = this.fb.group({
      id: [null],
      // Validación: Número > 0 
      numero: ['', [Validators.required, Validators.min(1)]], 
      // Validación: Tipo obligatorio 
      tipo: ['', [Validators.required]], 
      // Validación: Precio > 0 
      precio: ['', [Validators.required, Validators.min(0.01)]], 
      // Validación: Capacidad > 0 (asumimos min 1 persona) 
      capacidad: ['', [Validators.required, Validators.min(1)]],
      // Estado por defecto: Disponible
      estado: ['Disponible', [Validators.required]] 
    });
  }

  ngOnInit(): void {
    this.listarHabitaciones();
    
    // Validación de Rol: Solo ADMIN puede ver acciones de crear/editar 
    if (this.authService.hasRole(Roles.ADMIN)) {
      this.showActions = true;
    }
  }

  ngAfterViewInit(): void {
    // Configuración del Modal de Bootstrap
    this.modalInstance = new bootstrap.Modal(this.habitacionModalEl.nativeElement, { keyboard: false });
    
    // Al cerrar el modal, reseteamos el formulario
    this.habitacionModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.resetForm();
    });
  }

  // --- MÉTODOS DE API ---

  listarHabitaciones(): void {
    this.habitacionesService.getHabitaciones().subscribe({
      next: (resp) => {
        // Ordenamos por número de habitación para que se vea ordenado
        this.listaHabitaciones = resp.sort((a, b) => a.numero - b.numero);
      },
      error: (err) => {
        console.error('Error al cargar habitaciones', err);
      }
    });
  }

  onSubmit(): void {
    if (this.habitacionForm.invalid) return;

    const habitacionData: HabitacionRequest = this.habitacionForm.value;

    if (this.isEditMode && this.selectedHabitacion) {
      // MODO EDICIÓN (Solo ADMIN) 
      const id = this.selectedHabitacion.id;
      this.habitacionesService.putHabitacion(habitacionData, id).subscribe({
        next: (updated) => {
          // Actualizamos la lista localmente
          const index = this.listaHabitaciones.findIndex(h => h.id === id);
          if (index !== -1) this.listaHabitaciones[index] = updated;
          
          Swal.fire('Actualizado', `Habitación ${updated.numero} actualizada`, 'success');
          this.modalInstance.hide();
        }
      });

    } else {
      // MODO CREACIÓN (Solo ADMIN) 
      this.habitacionesService.postHabitacion(habitacionData).subscribe({
        next: (created) => {
          this.listaHabitaciones.push(created);
          // Reordenamos la lista
          this.listaHabitaciones.sort((a, b) => a.numero - b.numero);
          
          Swal.fire('Registrado', `Habitación ${created.numero} creada correctamente`, 'success');
          this.modalInstance.hide();
        }
      });
    }
  }

  // --- MÉTODOS DE UI ---

  toggleForm(): void {
    this.resetForm();
    this.modalText = 'Registrar Nueva Habitación';
    this.modalInstance.show();
  }

  editHabitacion(habitacion: HabitacionResponse): void {
    this.isEditMode = true;
    this.selectedHabitacion = habitacion;
    this.modalText = 'Editando Habitación: ' + habitacion.numero;
    
    // Cargar datos en el formulario
    this.habitacionForm.patchValue({ ...habitacion });
    this.modalInstance.show();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedHabitacion = null;
    this.habitacionForm.reset();
    // Valores por defecto al limpiar
    this.habitacionForm.patchValue({ estado: 'Disponible', tipo: '' });
  }
}