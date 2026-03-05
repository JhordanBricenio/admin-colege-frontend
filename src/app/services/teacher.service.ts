import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Teacher } from '../models/teacher';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }
  getUsers(): Observable<Teacher[]> {
    return this._http.get<Teacher[]>(this.url + 'teachers');
  }
  getUsersByPageable(page: number): Observable<any> {
    return this._http.get<any>(`${this.url}teachers/paged/${page}`);
  }
  saveUser(user: Teacher): Observable<Teacher> {
    return this._http.post<Teacher>(this.url + 'teachers', user);
  }
  getUserById(id: any): Observable<Teacher> {
    return this._http.get<Teacher>(this.url + 'teachers/' + id);
  }
  getUserByDni(dni: string): Observable<Teacher> {
    return this._http.post<Teacher>(this.url + 'teachers/dni', { dni });
  }
  updateUser(user: Teacher): Observable<any> {
    return this._http.patch<Teacher>(this.url + 'teachers/' + user.idTeacher, user);
  }
  deleteUser(id: any): Observable<any> {
    return this._http.delete(this.url + 'teachers/' + id);
  }
  searchByDniApi(dni: string): Observable<any> {
    return this._http.get<Teacher>(this.url + `teachers/dni/${dni}`);
  }
}
