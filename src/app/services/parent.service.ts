import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Parent } from '../models/parent';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }
  getUsers(): Observable<Parent[]> {
    return this._http.get<Parent[]>(this.url + 'parents');
  }
  getUsersByPageable(page: number): Observable<any> {
    return this._http.get<any>(`${this.url}parents/paged/${page}`);
  }
  saveUser(user: Parent): Observable<Parent> {
    return this._http.post<Parent>(this.url + 'parents', user);
  }
  getUserById(id: any): Observable<Parent> {
    return this._http.get<Parent>(this.url + 'parents/' + id);
  }
  getUserByDni(dni: string): Observable<Parent> {
    return this._http.post<Parent>(this.url + 'parents/dni', { dni });
  }
  updateUser(user: Parent): Observable<any> {
    return this._http.patch<Parent>(this.url + 'parents/' + user.idParent, user);
  }
  deleteUser(id: any): Observable<any> {
    return this._http.delete(this.url + 'parents/' + id);
  }
  searchByDniApi(dni: string): Observable<any> {
    return this._http.get<Parent>(this.url + `parents/dni/${dni}`);
  }
}
