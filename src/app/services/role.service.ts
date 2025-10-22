import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getRoles(): Observable<Role[]> {
    return this._http.get<Role[]>(this.url + 'roles');
  }

  createRole(role: Role): Observable<Role> {
    return this._http.post<Role>(this.url + 'roles', role);
  }

  getRoleById(id: string): Observable<Role> {
    return this._http.get<Role>(this.url + 'roles/' + id);
  }

  findByName(name: string): Observable<Role> {
    return this._http.get<Role>(this.url + 'roles/search/' + name);
  }
  updateRole(id: string, role: Role): Observable<Role> {
    return this._http.patch<Role>(this.url + 'roles/' + id, role);
  }
  deleteRole(id: string): Observable<void> {
    return this._http.delete<void>(this.url + 'roles/' + id);
  }

}
