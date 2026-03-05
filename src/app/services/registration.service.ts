import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { Registration } from '../models/registration';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  public url;


  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getLicenses(): Observable<Registration[]> {
    return this._http.get<Registration[]>(this.url + 'registration');
  }

  getLicenseByDniUser(dni: string): Observable<Registration> {
    return this._http.get<Registration>(this.url + 'registration/getByDni/' + dni);
  }

  findAlumnosByCursoId(id: any): Observable<Registration> {
    return this._http.get<Registration>(this.url + 'registration/getByDni/' + id);
  }

  createRegistration(registration: Registration): Observable<Registration> {
    return this._http.post<Registration>(this.url + 'registration', registration);
  }

  updateRegistration(id: string, registration: Registration): Observable<Registration> {
    return this._http.put<Registration>(this.url + 'registration/' + id, registration);
  }

  getRegistrationById(id: string): Observable<Registration> {
    return this._http.get<Registration>(this.url + 'registration/' + id);
  }

  deleteRegistration(id: string): Observable<any> {
    return this._http.delete<any>(this.url + 'registration/' + id);
  }
}

