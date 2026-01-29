import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environments } from '../environments/environments';
import { HabitacionRequest, HabitacionResponse } from '../models/Habitacion.model';  

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {

  // Concatenamos el endpoint específico para habitaciones
  private apiUrl: string = environments.apiUrl.concat('habitaciones');

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las habitaciones.
   * Ordena los resultados por número de habitación para que se vean ordenadas en la tabla HTML.
   */
  getHabitaciones(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(this.apiUrl).pipe(
      map((habitaciones) => {
        // Ordenamos por número de habitación ascendente (opcional, mejora la UI)
        return habitaciones.sort((a, b) => a.numero - b.numero);
      }),
      catchError((error) => {
        console.error('Error al obtener las habitaciones', error);
        return of([]);
      })
    );
  }

  /**
   * Crear una nueva habitación.
   * Usa HabitacionRequest ya que no enviamos el ID.
   */
  postHabitacion(habitacion: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.post<HabitacionResponse>(this.apiUrl, habitacion).pipe(
      catchError(error => {
        console.error('Error al registrar la habitación: ', error);
        throw error;
      })
    );
  }

  /**
   * Actualizar una habitación existente.
   * Requiere el ID en la URL y el objeto en el body.
   */
  putHabitacion(habitacion: HabitacionRequest, habitacionId: number): Observable<HabitacionResponse> {
    return this.http.put<HabitacionResponse>(`${this.apiUrl}/${habitacionId}`, habitacion).pipe(
      catchError(error => {
        console.error('Error al actualizar la habitación: ', error);
        throw error;
      })
    );
  }

  /**
   * Eliminar una habitación por ID.
   * Nota: Aunque tu HTML actual no tiene botón de borrar, es buena práctica dejarlo listo.
   */
  deleteHabitacion(habitacionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${habitacionId}`).pipe(
      catchError(error => {
        console.error('Error al eliminar la habitación: ', error);
        throw error;
      })
    );
  }
}