import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GLOBAL } from './GLOBAL';
import {
    KardexGlobalResponse,
    KardexGlobalRecord,
    KardexStudentResponse,
    GradeTermSummary,
    TERM_TO_BIMESTER
} from '../models/kardex';

@Injectable({
    providedIn: 'root'
})
export class KardexService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = GLOBAL.url;

    getGlobalKardex(page: number = 0, pageSize: number = 10): Observable<KardexGlobalResponse> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', pageSize);

        return this.http.get<any>(`${this.apiUrl}registrations/kardex/paged/${page}`, { params }).pipe(
            map(response => this.mapGlobalKardexResponse(response))
        );
    }

    getStudentKardexByDni(dni: string): Observable<KardexStudentResponse> {
        return this.http.get<KardexStudentResponse>(
            `${this.apiUrl}students/kardex-by-dni`,
            { params: new HttpParams().set('dni', dni) }
        ).pipe(
            map(response => this.normalizeStudentKardex(response))
        );
    }

    getStudentKardexById(studentId: string): Observable<KardexStudentResponse> {
        return this.http.get<KardexStudentResponse>(
            `${this.apiUrl}students/kardex-by-id/${studentId}`
        ).pipe(
            map(response => this.normalizeStudentKardex(response))
        );
    }
    private mapGlobalKardexResponse(response: any): KardexGlobalResponse {
        const records = (response.content || response || [])
            .map((record: any) => this.normalizeGlobalRecord(record))
            .filter((record: KardexGlobalRecord) => this.isStudentKardexRecord(record));

        return {
            content: records,
            totalElements: records.length,
            totalPages: response.totalPages || 1,
            currentPage: response.number || 0,
            pageSize: response.size || records.length
        };
    }
    private isStudentKardexRecord(record: KardexGlobalRecord): boolean {
        const hasStudentIdentity = !!record.studentId && !!record.studentDni && !!record.studentFullName;
        const hasAcademicContext = !!record.degreeId && !!record.educationLevelId;
        const isLikelyStaff = /docente|teacher|profesor|tutor/i.test(record.studentFullName || '');
        return hasStudentIdentity && hasAcademicContext && !isLikelyStaff;
    }
    private extractDniFromStudentCode(studentCode: string): string {
        const rawCode = String(studentCode || '').trim();
        if (!rawCode) {
            return '';
        }

        const match = rawCode.match(/(\d{8})$/);
        return match ? match[1] : '';
    }
    private normalizeGlobalRecord(record: any): KardexGlobalRecord {
        let gradesSummary = record.gradesSummary;
        if (typeof gradesSummary === 'string') {
            try {
                gradesSummary = JSON.parse(gradesSummary);
            } catch {
                gradesSummary = [];
            }
        }

        const normalizedStudentCode = String(record.studentCode || '').trim();
        const normalizedStudentDni = String(record.studentDni || '').trim() || this.extractDniFromStudentCode(normalizedStudentCode);

        return {
            idRegistration: record.idRegistration || '',
            registrationStatus: record.registrationStatus || 'true',
            registrationCreatedAt: record.registrationCreatedAt || '',
            registrationUpdatedAt: record.registrationUpdatedAt || '',
            studentId: record.studentId || '',
            studentCode: normalizedStudentCode,
            studentFullName: record.studentFullName || '',
            studentDni: normalizedStudentDni,
            studentPhone: record.studentPhone || '',
            studentEmail: record.studentEmail || '',
            parentId: record.parentId || '',
            parentFullName: record.parentFullName || '',
            parentPhone: record.parentPhone || '',
            parentDni: record.parentDni || '',
            parentRelationship: record.parentRelationship || '',
            degreeId: record.degreeId || '',
            degreeCourse: record.degreeCourse || '',
            degreeSection: record.degreeSection || '',
            educationLevelId: record.educationLevelId || '',
            educationLevelName: record.educationLevelName || '',
            gradesSummary: gradesSummary || [],
            paymentsCount: record.paymentsCount || 0,
            paymentsTotal: record.paymentsTotal || 0
        };
    }
    private normalizeStudentKardex(response: KardexStudentResponse): KardexStudentResponse {
        if (!response.records) {
            response.records = [];
        }
        response.records.forEach(record => {
            record.courses.forEach(course => {
                if (course.termGrades) {
                    Object.keys(course.termGrades).forEach(key => {
                        const value = course.termGrades[key as keyof typeof course.termGrades];
                        if (value !== null && value !== undefined) {
                            course.termGrades[key as keyof typeof course.termGrades] = Number(value) || null;
                        }
                    });
                }
                if (course.annualAverage === null || course.annualAverage === undefined) {
                    const grades = Object.values(course.termGrades)
                        .filter((g): g is number => g !== null && g !== undefined);
                    if (grades.length > 0) {
                        course.annualAverage = Number((grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2));
                    }
                }
            });
            if (!record.summary.gpa) {
                const courseAverages = record.courses
                    .map(c => c.annualAverage)
                    .filter((avg): avg is number => avg !== null && avg !== undefined);
                if (courseAverages.length > 0) {
                    record.summary.gpa = Number((courseAverages.reduce((a, b) => a + b, 0) / courseAverages.length).toFixed(2));
                }
            }
        });
        if (!response.globalSummary) {
            const allYearGpas = response.records
                .map(r => r.summary.gpa)
                .filter((gpa): gpa is number => gpa !== null && gpa !== undefined);

            response.globalSummary = {
                gpaHistorical: allYearGpas.length > 0
                    ? Number((allYearGpas.reduce((a, b) => a + b, 0) / allYearGpas.length).toFixed(2))
                    : null,
                totalApprovedCourses: response.records.reduce((sum, r) => sum + (r.summary.approvedCourses || 0), 0),
                totalFailedCourses: response.records.reduce((sum, r) => sum + (r.summary.failedCourses || 0), 0),
                totalInProgressCourses: response.records.reduce((sum, r) => sum + (r.summary.inProgressCourses || 0), 0),
                yearsRegistered: response.records.length
            };
        }

        return response;
    }
}
