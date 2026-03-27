import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { TeacherSubjectAssignments } from '../models/teacherSubjectAssignments';

@Injectable({
  providedIn: 'root'
})
export class TeacherSubjectAssignmentsService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }
  getTeacherSubjectAssignments(): Observable<TeacherSubjectAssignments[]> {
    return this._http.get<TeacherSubjectAssignments[]>(this.url + 'teachers/assignments');
  }
  saveTeacherSubjectAssignments(user: TeacherSubjectAssignments): Observable<TeacherSubjectAssignments> {
    return this._http.post<TeacherSubjectAssignments>(this.url + 'teachers/assignments', user);
  }
  getTeacherSubjectAssignmentsById(id: any): Observable<TeacherSubjectAssignments> {
    return this._http.get<TeacherSubjectAssignments>(this.url + 'teachers/assignments/' + id);
  }

  updateTeacherSubjectAssignments(user: TeacherSubjectAssignments): Observable<any> {
    return this._http.patch<TeacherSubjectAssignments>(this.url + 'teachers/assignments/' + user.idTeacherSubjectAssignments, user);
  }
  deleteTeacherSubjectAssignments(id: any): Observable<any> {
    return this._http.delete(this.url + 'teachers/assignments/' + id);
  }
}
