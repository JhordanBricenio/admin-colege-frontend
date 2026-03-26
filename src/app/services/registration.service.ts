import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Registration } from '../models/registration';
import { RegistrationDTO } from '../models/registrationDTO';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  public url;


  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getRegistrations(): Observable<Registration[]> {
    return this._http.get<Registration[]>(this.url + 'registrations').pipe(
      map(registrations => this.mapRegistrations(registrations))
    );
  }

  getRegistrationsByPageable(page: number): Observable<any> {
    return this._http.get<any>(`${this.url}registrations/details/paged/${page}`);
  }

  private mapRegistrations(registrations: any[]): Registration[] {
    return registrations.map(reg => ({
      ...reg,
      createdAt: reg.createdAt ? new Date(reg.createdAt) : undefined,
      updatedAt: reg.updatedAt ? new Date(reg.updatedAt) : undefined
    }));
  }

  getRegistrationByDetail(idRegistration: string): Observable<RegistrationDTO> {
    return this._http.get<RegistrationDTO>(this.url + 'registrations/details/' + idRegistration);
  }

  findRegistrationsByCursoId(id: any): Observable<Registration> {
    return this._http.get<Registration>(this.url + 'registrations/getByDni/' + id);
  }

  createRegistration(registration: Registration): Observable<Registration> {
    return this._http.post<Registration>(this.url + 'registrations', registration);
  }

  updateRegistration(id: string, registration: Registration): Observable<Registration> {
    return this._http.patch<Registration>(this.url + 'registrations/' + id, registration);
  }

  getRegistrationById(id: string): Observable<Registration> {
    return this._http.get<Registration>(this.url + 'registrations/' + id);
  }

  deleteRegistration(id: string): Observable<any> {
    return this._http.delete<any>(this.url + 'registrations/' + id);
  }
}

