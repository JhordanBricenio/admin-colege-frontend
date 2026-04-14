import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { StudentGrade } from '../models/student-grade';

@Injectable({
  providedIn: 'root'
})
export class StudentGradeService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }
  getStudentGrades(): Observable<StudentGrade[]> {
    return this._http.get<StudentGrade[]>(this.url + 'student-grades');
  }
  saveStudentGrades(studentGrade: StudentGrade): Observable<StudentGrade> {
    return this._http.post<StudentGrade>(this.url + 'student-grades', studentGrade);
  }
  getStudentGradesById(id: any): Observable<StudentGrade> {
    return this._http.get<StudentGrade>(this.url + 'student-grades/' + id);
  }

  updateStudentGrades(studentGrade: StudentGrade): Observable<any> {
    return this._http.patch<StudentGrade>(this.url + 'student-grades/' + studentGrade.idStudentGrade, studentGrade);
  }
  deleteStudentGrade(id: any): Observable<any> {
    return this._http.delete(this.url + 'student-grades/' + id);
  }
}
