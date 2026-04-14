import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    Assistance,
    AssistancePageResponse,
    AssistanceStatus,
    StudentAttendanceBulkCreateRequest,
    StudentAttendanceCreateRequest,
    TeacherAttendanceBulkCreateRequest,
    TeacherAttendanceCreateRequest
} from '../models/assistance';
import { GLOBAL } from './GLOBAL';

@Injectable({
    providedIn: 'root'
})
export class AssistanceService {

    public url: string;

    constructor(private _http: HttpClient) {
        this.url = GLOBAL.url;
    }

    getTeacherAttendanceByPageable(
        page: number,
        teacherId?: string,
        startDate?: string,
        endDate?: string,
        status?: AssistanceStatus,
        size?: number
    ): Observable<AssistancePageResponse> {
        let params = new HttpParams();

        if (teacherId) {
            params = params.set('teacherId', teacherId);
        }

        if (startDate) {
            params = params.set('startDate', startDate);
        }

        if (endDate) {
            params = params.set('endDate', endDate);
        }

        if (status) {
            params = params.set('status', status);
            console.log('Status filter applied:', status);
        }

        if (size != null) {
            params = params.set('size', size);
        }

        return this._http.get<AssistancePageResponse>(`${this.url}teachers/attendances/paged/${page}`, { params });
    }

    getStudentAttendanceByPageable(
        page: number,
        studentId?: string,
        startDate?: string,
        endDate?: string,
        status?: AssistanceStatus,
        size?: number
    ): Observable<AssistancePageResponse> {
        let params = new HttpParams();

        if (studentId) {
            params = params.set('studentId', studentId);
        }

        if (startDate) {
            params = params.set('startDate', startDate);
        }

        if (endDate) {
            params = params.set('endDate', endDate);
        }

        if (status) {
            params = params.set('status', status);
        }

        if (size != null) {
            params = params.set('size', size);
        }

        return this._http.get<AssistancePageResponse>(`${this.url}students/attendances/paged/${page}`, { params });
    }

    createTeacherAttendance(payload: TeacherAttendanceCreateRequest): Observable<Assistance> {
        return this._http.post<Assistance>(`${this.url}teachers/attendances/` + payload.teacherId, payload);
    }

    getTeacherAttendanceById(idAttendance: string): Observable<Assistance> {
        return this._http.get<Assistance>(`${this.url}teachers/attendances/${idAttendance}`);
    }

    updateTeacherAttendance(idAttendance: string, payload: TeacherAttendanceCreateRequest): Observable<Assistance> {
        return this._http.patch<Assistance>(`${this.url}teachers/attendances/${idAttendance}`, payload);
    }

    createTeacherAttendanceBulk(payload: TeacherAttendanceBulkCreateRequest): Observable<Assistance[]> {
        return this._http.post<Assistance[]>(`${this.url}teachers/attendances/bulk`, payload);
    }

    createStudentAttendance(payload: StudentAttendanceCreateRequest): Observable<Assistance> {
        return this._http.post<Assistance>(`${this.url}students/attendances/` + payload.studentId, payload);
    }

    createStudentAttendanceBulk(payload: StudentAttendanceBulkCreateRequest): Observable<Assistance[]> {
        return this._http.post<Assistance[]>(`${this.url}students/attendances/bulk`, payload);
    }
}
