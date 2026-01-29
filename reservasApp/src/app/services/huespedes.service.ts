import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { HuespedRequest, HuespedResponse } from '../models/Huesped.models';
import { environments } from '../environments/environments';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class HuespedesService {

private apiUrl: string = environments.apiUrl.concat('huespedes');

  constructor(private http: HttpClient) { }

  getHuespedes(): Observable<HuespedResponse[]> {
    return this.http.get<HuespedResponse[]>(this.apiUrl).pipe(
      map((huespedes) => huespedes.sort()),
      catchError((error) => {
        console.error('Error al obtener los huespedes', error);
        return of([]);
      }),
    );
  }

  postHuesped(huesped: HuespedRequest): Observable<HuespedResponse>{
    return this.http.post<HuespedResponse>(this.apiUrl, huesped).pipe(
      catchError(error => {
        console.error('Error al registrar un huesped: ', error);
        throw error;
      })
    );
}

putHuesped(huesped: HuespedRequest, huespedId: number): Observable<HuespedResponse>{
    return this.http.put<HuespedResponse>(`${this.apiUrl}/${huespedId}`, huesped).pipe(
      catchError(error => {
        console.error('Error al actualizar un huesped: ', error);
        throw error;
      })
    );
  }

  deleteHuesped(huespedId: number): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${huespedId}`).pipe(
      catchError(error => {
        console.error('Error al eliminar un huesped: ', error);
        throw error;
      })
    );
  }


}
