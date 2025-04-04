import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public url;
  
  constructor(private _http: HttpClient) {
    this.url=GLOBAL.url;
  }
  getUsers():Observable<User[]>{
    return this._http.get<User[]>(this.url+'users');
  }

  //createAlumnosAll()
  createAlumnosAll(user:User):Observable<any>{
    return this._http.post(this.url+'users',user);
  }

  //getAlumnoById()
  getAlumnoById(id:any):Observable<User>{
    return this._http.get<User>(this.url+'users/'+id);
  }

  getUserByDni(dni: string): Observable<User> {
    return this._http.post<User>(this.url + 'users/dni', { dni });
    }
  

  //updateAlumno()
  updateAlumno(user:User):Observable<any>{
    return this._http.put(this.url+'users/'+user.id,user);
  }

  //deleteAlumno()
  deleteAlumno(id:any):Observable<any>{
    return this._http.delete(this.url+'users/'+id);
  }

  subirFoto(foto: File, id:any): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append('file', foto);
    formData.append('id', id.toString());
    const req = new HttpRequest('POST', this.url + 'users/upload', formData,{reportProgress: true});
    return this._http.request(req).pipe(
       catchError(e => {
          return throwError(()=>e);
       })
    );
  

 }
}
