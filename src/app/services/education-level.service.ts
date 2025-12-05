import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { EducationLevel } from '../models/education-level';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EducationLevelService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getEducationLevels(): Observable<EducationLevel[]> {
    return this._http.get<EducationLevel[]>(this.url + 'education-levels');
  }

  createEducationLevel(EducationLevel: EducationLevel): Observable<EducationLevel> {
    return this._http.post<EducationLevel>(this.url + 'education-levels', EducationLevel);
  }

  getEducationLevelById(id: string): Observable<EducationLevel> {
    return this._http.get<EducationLevel>(this.url + 'education-levels/' + id);
  }

  findByName(name: string): Observable<EducationLevel> {
    return this._http.get<EducationLevel>(this.url + 'education-levels/search/' + name);
  }
  updateEducationLevel(id: string, EducationLevel: EducationLevel): Observable<EducationLevel> {
    return this._http.patch<EducationLevel>(this.url + 'education-levels/' + id, EducationLevel);
  }
  deleteEducationLevel(id: string): Observable<void> {
    return this._http.delete<void>(this.url + 'education-levels/' + id);
  }
}
