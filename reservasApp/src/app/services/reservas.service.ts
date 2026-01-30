import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../environments/environments';
import { Reserva } from '../models/Reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private apiUrl = environments.apiUrl + 'reservas';

  constructor(private http: HttpClient) {}

  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  crearReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva);
  }

  actualizarEstado(id: number, estado: string): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}