import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { Degree } from '../models/degree';

@Injectable({
  providedIn: 'root'
})
export class DegreeService {

  public url;
    
    constructor(private _http: HttpClient) {
      this.url=GLOBAL.url;
    }
    getDegrees():Observable<Degree[]>{
      return this._http.get<Degree[]>(this.url+'degrees');
    }

    getDegree(idDegree: number): Observable<Degree> {
      return this._http.get<Degree>(`${this.url}degrees/${idDegree}`);
    }

    //{{base_url}}/api/degrees/assign-course/2
    assignCoursesToDegree(idDegree: number, cursos: any[]): Observable<any> {
      return this._http.post(`${this.url}degrees/assign-course/${idDegree}`, cursos);
    }
    

  

    //{{base_url}}/api/degrees/withCourses/{{idDegree}}
    getDegreesWithCourses(idDegree: number): Observable<any> {
      return this._http.get<any>(`${this.url}degrees/withCourses/${idDegree}`);
    }
    

}
