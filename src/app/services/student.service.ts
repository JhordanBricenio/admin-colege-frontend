import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { Student } from '../models/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }
  getUsers(): Observable<Student[]> {
    return this._http.get<Student[]>(this.url + 'students');
  }
  getUsersByPageable(page: number): Observable<any> {
    return this._http.get<any>(`${this.url}students/paged/${page}`);
  }
  saveUser(user: Student): Observable<Student> {
    return this._http.post<Student>(this.url + 'students', user);
  }
  getUserById(id: any): Observable<Student> {
    return this._http.get<Student>(this.url + 'students/' + id);
  }
  getUserByDni(dni: string): Observable<Student> {
    return this._http.post<Student>(this.url + 'students/dni', { dni });
  }
  updateUser(user: Student): Observable<any> {
    return this._http.patch<Student>(this.url + 'students/' + user.idStudent, user);
  }
  deleteUser(id: any): Observable<any> {
    return this._http.delete(this.url + 'students/' + id);
  }
  searchByDniApi(dni: string): Observable<any> {
    return this._http.get<Student>(this.url + `students/dni/${dni}`);
  }
}
