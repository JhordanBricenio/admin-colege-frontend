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
    this.url=GLOBAL.url;
  }

  getLicenses():Observable<Registration[]>{
    return this._http.get<Registration[]>(this.url+'registration');
  }

  getLicenseByDniUser(dni: string):Observable<Registration>{
    return this._http.get<Registration>(this.url+'registration/getByDni/'+dni);
  }

  findAlumnosByCursoId(id: any):Observable<Registration>{
    return this._http.get<Registration>(this.url+'registration/getByDni/'+id);
  }
}
