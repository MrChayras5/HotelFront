import { Component, ElementRef, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HuespedRequest, HuespedResponse } from '../../models/Huesped.models';
import { filter } from 'rxjs';
import { HuespedesService } from '../../services/huespedes.service';
import Swal from 'sweetalert2';
import { Roles } from '../../constants/Roles';
import { AuthService } from '../../services/auth.service';



declare var bootstrap: any;

@Component({
  selector: 'app-huespedes',
  standalone: false,
  templateUrl: './huespedes.component.html',
  styleUrl: './huespedes.component.css'
})

export class HuespedesComponent implements OnInit, AfterViewInit {

  modalText: string = 'Registrar Huesped';
 
  listaDocumentos: string[] = [
    'INE', 'PASAPORTE', 'LICENCIA'
  ];

  listaHuespedes: HuespedResponse[] = []

  isEditMode: boolean = false;
  selectedHuesped: HuespedResponse | null = null;
  showActions: boolean = false;


  @ViewChild('huespedModalRef')
  huespedModalEl!: ElementRef;
  huespedForm: FormGroup;

   
  private modalInstance!: any;

  constructor(private fb: FormBuilder, private huespedesService: HuespedesService, private authService: AuthService){
    this.huespedForm = this.fb.group({
    id: [null],
    nombre:['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^(?!\s*$).+/)]], 
    apellido:['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^(?!\s*$).+/)]], 
    email:['', [Validators.required, Validators.maxLength(50), Validators.email]],  //sino funciona agregar: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern(/^[0-9]{10}$/)]],  //sino funciona agregar mejor: telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    documento: [null, [Validators.required]], 
    });
  }



ngOnInit(): void {
  this.listarHuespedes();
  if(this.authService.hasRole(Roles.ADMIN))
    this.showActions = true;
}

ngAfterViewInit(): void {
  this.modalInstance = new bootstrap.Modal(this.huespedModalEl.nativeElement, { keyboard: false});
  this.huespedModalEl.nativeElement.addEventListener('hidden.bs.modal', ()=> {
    this.resetForm();
  });
 
}

listarHuespedes(): void{
  this.huespedesService.getHuespedes().subscribe({
    next: resp => {
      this.listaHuespedes = resp;
    }
  })
}

toggleForm(): void{
  this.resetForm();
  this.modalText = 'Registrar Huesped';
  this.modalInstance.show();
}

editHuesped(huesped: HuespedResponse): void{
  this.isEditMode = true;
  this.selectedHuesped = huesped;
  this.modalText = 'Editando Huesped: '+ huesped.nombre;

  this.huespedForm.patchValue({...huesped});
  this.modalInstance.show();
}

resetForm(): void{
  this.isEditMode = false;
  this.selectedHuesped = null;
  this.huespedForm.reset();   
}

onSubmit(): void{
  if(this.huespedForm.invalid) return;
  const huespedData: HuespedRequest = this.huespedForm.value;
  // console.info("Datos del nuevo huesped: ", huespedData);

  if(this.isEditMode && this.selectedHuesped){
    const id = this.selectedHuesped.id;
    this.huespedesService.putHuesped(huespedData, id).subscribe({
      next: updated => {
        const index = this.listaHuespedes.findIndex(h => h.id == id);
        if(index !== -1) this.listaHuespedes[index] = updated;
        Swal.fire('Actualizado', 'Huesped actualizado correctamente', 'success');
          this.modalInstance.hide();
    
      }
    });
  }else{

    this.huespedesService.postHuesped(huespedData).subscribe({
      next: registro => {
        this.listaHuespedes.push(registro);
        Swal.fire('Registrado','Huesped registrado correctamente', 'success');
        this.modalInstance.hide();
      }
    });

  }
}

deleteHuesped(idHuesped: number): void{
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'El huesped será eliminado permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if(result.isConfirmed){
      this.huespedesService.deleteHuesped(idHuesped).subscribe({
        next: () => {
          this.listaHuespedes = this.listaHuespedes.filter(h => h.id !== idHuesped);
          Swal.fire('Eliminado', 'Huesped eliminado correctamente', 'success');
        }
      })
    }
  })
}}