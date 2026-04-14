export type AssistanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED' | string;

export class Assistance {
    idAttendance?: string;
    teacherId: string;
    teacherName?: string;
    teacherDni?: string;
    studentId?: string;
    studentName?: string;
    studentDni?: string;
    attendanceDate: string;
    session: string;
    status: AssistanceStatus;
    minutesLate?: number;
    justification?: string;
    source?: string;
}

export interface AssistancePageResponse {
    content: Assistance[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    numberOfElements: number;
}

export interface TeacherAttendanceCreateRequest {
    teacherId: string;
    attendanceDate: string;
    minutesLate: number;
    session: string;
    status: AssistanceStatus;
    justification?: string;
    source: string;
}

export interface TeacherAttendanceBulkRecord {
    teacherId: string;
    status: AssistanceStatus;
    minutesLate: number;
    justification?: string;
    source?: string;
}

export interface TeacherAttendanceBulkCreateRequest {
    date: string;
    session: string;
    records: TeacherAttendanceBulkRecord[];
    conflictStrategy: string;
}

export interface StudentAttendanceCreateRequest {
    studentId: string;
    attendanceDate: string;
    minutesLate: number;
    session: string;
    status: AssistanceStatus;
    justification?: string;
    source: string;
}

export interface StudentAttendanceBulkRecord {
    studentId: string;
    status: AssistanceStatus;
    minutesLate: number;
    justification?: string;
    source?: string;
}

export interface StudentAttendanceBulkCreateRequest {
    date: string;
    session: string;
    records: StudentAttendanceBulkRecord[];
    conflictStrategy: string;
}
