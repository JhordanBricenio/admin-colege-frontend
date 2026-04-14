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

  private buildAssignmentRequestBody(user: TeacherSubjectAssignments): any {
    const payload: any = {
      status: !!user.status,
      teacherId: (user.teacherId || '').trim()
    };

    const degreeId = (user.degreeId || '').trim();
    const courseId = (user.courseId || '').trim();

    // Enviar los campos que vengan del componente validado
    if (degreeId) {
      payload.degreeId = degreeId;
    }
    if (courseId) {
      payload.courseId = courseId;
    }

    return payload;
  }

  getTeacherSubjectAssignments(): Observable<TeacherSubjectAssignments[]> {
    return this._http.get<TeacherSubjectAssignments[]>(this.url + 'teachers/assignments');
  }
  saveTeacherSubjectAssignments(user: TeacherSubjectAssignments): Observable<TeacherSubjectAssignments> {
    const payload = this.buildAssignmentRequestBody(user);
    return this._http.post<TeacherSubjectAssignments>(this.url + 'teachers/assignments', payload);
  }
  getTeacherSubjectAssignmentsById(id: any): Observable<TeacherSubjectAssignments> {
    return this._http.get<TeacherSubjectAssignments>(this.url + 'teachers/assignments/' + id);
  }

  updateTeacherSubjectAssignments(user: TeacherSubjectAssignments): Observable<any> {
    const payload = this.buildAssignmentRequestBody(user);
    return this._http.patch<TeacherSubjectAssignments>(this.url + 'teachers/assignments/' + user.idTeacherSubjectAssignments, payload);
  }
  deleteTeacherSubjectAssignments(id: any): Observable<any> {
    return this._http.delete(this.url + 'teachers/assignments/' + id);
  }
}
