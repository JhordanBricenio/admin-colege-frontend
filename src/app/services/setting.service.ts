import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { Setting } from '../models/setting';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getSettings(): Observable<Setting[]> {
    return this._http.get<Setting[]>(this.url + 'settings');
  }

  getSettingById(idSetting: string): Observable<Setting> {
    return this._http.get<Setting>(this.url + 'settings/' + idSetting);
  }

  createSetting(payload: Partial<Setting>): Observable<Setting> {
    return this._http.post<Setting>(this.url + 'settings', payload);
  }

  updateSetting(id: string, payload: Partial<Setting>): Observable<Setting> {
    return this._http.put<Setting>(`${this.url}settings/${id}`, payload);
  }
}
