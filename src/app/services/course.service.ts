import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Course } from '../models/course';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  public url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }
  getCourses(): Observable<Course[]> {
    return this._http.get<Course[]>(this.url + 'courses');
  }

  createCourse(course: Course): Observable<Course> {
    return this._http.post<Course>(this.url + 'courses', course);
  }

  updateCourse(idCourse: string, course: Course): Observable<Course> {
    return this._http.put<Course>(`${this.url}courses/${idCourse}`, course);
  }

  getCourse(idCourse: string): Observable<Course> {
    return this._http.get<Course>(`${this.url}courses/${idCourse}`);
  }

  deleteCourse(idCourse: string): Observable<any> {
    return this._http.delete<any>(`${this.url}courses/${idCourse}`);
  }
}
