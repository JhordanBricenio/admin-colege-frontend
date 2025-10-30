import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { Management } from '../models/management';

@Injectable({
  providedIn: 'root'
})
export class ManagementService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getManagements(): Observable<Management[]> {
    return this._http.get<Management[]>(this.url + 'managements');
  }

  createManagement(management: Management): Observable<Management> {
    return this._http.post<Management>(this.url + 'managements', management);
  }

  getManagementById(id: string): Observable<Management> {
    return this._http.get<Management>(this.url + 'managements/' + id);
  }
  updateManagement(id: string, management: Management): Observable<Management> {
    return this._http.patch<Management>(this.url + 'managements/' + id, management);
  }
  deleteManagement(id: string): Observable<void> {
    return this._http.delete<void>(this.url + 'managements/' + id);
  }
}
