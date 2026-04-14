export interface KardexGlobalRecord {
    idRegistration: string;
    registrationStatus: string | boolean;
    registrationCreatedAt: string;
    registrationUpdatedAt: string;
    studentId: string;
    studentCode: string;
    studentFullName: string;
    studentDni: string;
    studentPhone: string;
    studentEmail: string;
    parentId: string;
    parentFullName: string;
    parentPhone: string;
    parentDni: string;
    parentRelationship: string;
    degreeId: string;
    degreeCourse: string;
    degreeSection: string;
    educationLevelId: string;
    educationLevelName: string;
    gradesSummary: string | GradeTermSummary[];
    paymentsCount: number;
    paymentsTotal: number;
}

export interface KardexGlobalResponse {
    content: KardexGlobalRecord[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface KardexStudentResponse {
    student: KardexStudentInfo;
    records: KardexYearRecord[];
    globalSummary?: KardexGlobalSummary;
}

export interface KardexStudentInfo {
    id: string;
    code: string;
    fullName: string;
    dni?: string;
    email?: string;
    studentDni?: string;
    studentPhone?: string;
    studentEmail?: string;
    degreeId?: string;
    degreeCourse?: string;
    degreeSection?: string;
    educationLevelId?: string;
    educationLevelName?: string;
    parentId?: string;
    parentFullName?: string;
    parentPhone?: string;
    parentDni?: string;
    parentRelationship?: string;
}

export interface KardexYearRecord {
    year: number;
    educationLevelId?: string;
    educationLevelName?: string;
    degreeId?: string;
    degreeName?: string; // ej: "SECUNDARIA-1 A"
    courses: KardexCourseRecord[];
    summary: KardexYearSummary;
}

export interface KardexCourseRecord {
    courseId: string;
    courseName: string;
    teacherId?: string;
    teacherName?: string;
    termGrades: {
        BIMESTER_1: number | null;
        BIMESTER_2: number | null;
        BIMESTER_3: number | null;
        BIMESTER_4: number | null;
    };
    annualAverage: number | null;
    minPromotionGrade?: number;
    status: 'APPROVED' | 'FAILED' | 'IN_PROGRESS' | 'WITHDRAWN';
    observations?: string;
}

export interface KardexYearSummary {
    gpa: number | null; // Promedio del año
    approvedCourses: number;
    failedCourses: number;
    inProgressCourses: number;
    withdrawnCourses?: number;
}

export interface KardexGlobalSummary {
    gpaHistorical: number | null; // Promedio histórico de todos los años
    totalApprovedCourses: number;
    totalFailedCourses: number;
    totalInProgressCourses: number;
    yearsRegistered: number;
}

// ============ HELPERS ============
export interface GradeTermSummary {
    term: number;
    grade: string | number;
}

// Mapeo de términos a bimestres
export const TERM_TO_BIMESTER: Record<number, string> = {
    0: 'BIMESTER_1',
    1: 'BIMESTER_2',
    2: 'BIMESTER_3',
    3: 'BIMESTER_4'
};

export const BIMESTER_LABELS: Record<string, string> = {
    BIMESTER_1: '1er Bimestre',
    BIMESTER_2: '2do Bimestre',
    BIMESTER_3: '3er Bimestre',
    BIMESTER_4: '4to Bimestre'
};

export const STATUS_COLORS: Record<string, string> = {
    APPROVED: 'success',
    FAILED: 'danger',
    IN_PROGRESS: 'warning',
    WITHDRAWN: 'secondary'
};

export const STATUS_LABELS: Record<string, string> = {
    APPROVED: 'Aprobado',
    FAILED: 'Desaprobado',
    IN_PROGRESS: 'En Progreso',
    WITHDRAWN: 'Retirado'
};
