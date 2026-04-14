import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth';

export interface LoginRequest {
  identifier: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const identifier = (credentials.identifier || '').trim();
    const password = credentials.password || '';

    return this._http.post<AuthResponse>(`${this.url}auth/login`, {
      identifier,
      password
    });
  }

  getUsers(): Observable<User[]> {
    return this._http.get<User[]>(this.url + 'users');
  }

  getUsersByPageable(page: number): Observable<any> {
    return this._http.get<any>(`${this.url}users/paged/${page}`);
  }
  saveUser(user: User): Observable<User> {
    return this._http.post<User>(this.url + 'users', user);
  }

  getUserById(id: any): Observable<User> {
    return this._http.get<User>(this.url + 'users/' + id);
  }


  getUserByDni(dni: string): Observable<User> {
    return this._http.post<User>(this.url + 'users/dni', { dni });
  }

  updateUser(user: User): Observable<any> {
    return this._http.patch<User>(this.url + 'users/' + user.idUser, user);
  }
  deleteUser(id: any): Observable<any> {
    return this._http.delete(this.url + 'users/' + id);
  }

  searchByDniApi(dni: string): Observable<any> {
    return this._http.get<User>(this.url + `users/dni/${dni}`);
  }

  subirFoto(foto: File, id: any): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append('file', foto);
    formData.append('id', id.toString());
    const req = new HttpRequest('POST', this.url + 'users/upload', formData, { reportProgress: true });
    return this._http.request(req).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );


  }
}
