import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HuespedesComponent } from './components/huespedes/huespedes.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HabitacionesComponent } from './components/habitaciones/habitaciones.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { Roles } from './constants/Roles';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],children: [
  { path: 'huespedes', component: HuespedesComponent, canActivate: [AuthGuard]},
  { path: 'habitaciones', component: HabitacionesComponent, canActivate: [AuthGuard]},
   { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard], data: { roles: [Roles.ADMIN]}}
]},
{ path: '**', redirectTo: 'dashboard'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
