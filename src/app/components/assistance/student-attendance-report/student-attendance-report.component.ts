import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Assistance, AssistanceStatus } from '../../../models/assistance';
import { Course } from '../../../models/course';
import { Degree } from '../../../models/degree';
import { EducationLevel } from '../../../models/education-level';
import { Student } from '../../../models/student';
import { Teacher } from '../../../models/teacher';
import { TeacherSubjectAssignments } from '../../../models/teacherSubjectAssignments';
import { AssistanceService } from '../../../services/assistance.service';
import { AuthSessionService } from '../../../services/auth-session.service';
import { CourseService } from '../../../services/course.service';
import { DegreeService } from '../../../services/degree.service';
import { EducationLevelService } from '../../../services/education-level.service';
import { StudentService } from '../../../services/student.service';
import { TeacherService } from '../../../services/teacher.service';
import { TeacherSubjectAssignmentsService } from '../../../services/teacherSubjectAssignments.service';

interface AttendanceScopeOption {
    key: string;
    label: string;
    teacherId: string;
    educationLevelId: string;
    degreeId: string;
    courseId?: string;
    scopeType: 'GRADE' | 'COURSE';
}

interface MonthlyStudentRow {
    studentId: string;
    fullName: string;
    dni: string;
    code: string;
    statusByDay: Record<number, AssistanceStatus | ''>;
    absences: number;
    lates: number;
}

@Component({
    selector: 'app-student-attendance-report',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './student-attendance-report.component.html',
    styleUrl: './student-attendance-report.component.css'
})
export class StudentAttendanceReportComponent {

    private readonly assistanceService = inject(AssistanceService);
    private readonly studentService = inject(StudentService);
    private readonly teacherService = inject(TeacherService);
    private readonly assignmentService = inject(TeacherSubjectAssignmentsService);
    private readonly educationLevelService = inject(EducationLevelService);
    private readonly degreeService = inject(DegreeService);
    private readonly courseService = inject(CourseService);
    readonly authSession = inject(AuthSessionService);
    private readonly route = inject(ActivatedRoute);

    loading = false;
    loadingReport = false;

    selectedTeacherId = '';
    selectedScopeKey = '';
    monthValue = this.getCurrentMonth();

    teachers: Teacher[] = [];
    allAssignments: TeacherSubjectAssignments[] = [];
    scopeOptions: AttendanceScopeOption[] = [];

    students: Student[] = [];
    educationLevels: EducationLevel[] = [];
    degrees: Degree[] = [];
    courses: Course[] = [];

    monthRows: MonthlyStudentRow[] = [];
    monthDays: number[] = [];

    ngOnInit(): void {
        this.resolveContext();
        this.loadCatalogs();
        this.loadTeachers();
        this.loadStudents();
        this.loadAssignments();
    }

    get currentScope(): AttendanceScopeOption | null {
        return this.scopeOptions.find((item) => item.key === this.selectedScopeKey) || null;
    }

    get totalAbsences(): number {
        return this.monthRows.reduce((sum, row) => sum + row.absences, 0);
    }

    get totalLates(): number {
        return this.monthRows.reduce((sum, row) => sum + row.lates, 0);
    }

    get studentsWithAbsencesCount(): number {
        return this.monthRows.filter((row) => row.absences > 0).length;
    }

    onTeacherChange(teacherId: string): void {
        this.selectedTeacherId = teacherId;
        if (teacherId) {
            sessionStorage.setItem('currentTeacherId', teacherId);
        }
        this.rebuildScopeOptions();
        this.clearReport();
    }

    onScopeChange(scopeKey: string): void {
        this.selectedScopeKey = scopeKey;
        this.clearReport();
    }

    loadMonthlyReport(): void {
        if (!this.selectedScopeKey) {
            Swal.fire('Atencion', 'Selecciona un contexto académico para ver el reporte.', 'warning');
            return;
        }

        const dateRange = this.getMonthDateRange(this.monthValue);
        if (!dateRange) {
            Swal.fire('Atencion', 'Selecciona un mes válido.', 'warning');
            return;
        }

        const scopedStudents = this.getScopedStudents();
        if (scopedStudents.length === 0) {
            this.clearReport();
            Swal.fire('Atencion', 'No hay alumnos en el contexto seleccionado.', 'warning');
            return;
        }

        this.loadingReport = true;
        this.fetchMonthlyAttendances(dateRange.startDate, dateRange.endDate, (records) => {
            this.buildMonthlyRows(scopedStudents, records, dateRange.daysInMonth);
            this.loadingReport = false;
        });
    }

    getEducationLevelNameById(id: string): string {
        if (!id) {
            return '-';
        }
        const level = this.educationLevels.find((item) => item.idEducationLevel === id);
        return level ? `${level.name} - ${level.shift}` : id;
    }

    getDegreeNameById(id: string): string {
        if (!id) {
            return '-';
        }
        const degree = this.degrees.find((item) => item.idDegree === id);
        return degree ? `${degree.course} ${degree.section}` : id;
    }

    getCourseNameById(id: string): string {
        if (!id) {
            return '-';
        }
        const course = this.courses.find((item) => item.idCourse === id);
        return course?.name || id;
    }

    getStatusShort(status: AssistanceStatus | ''): string {
        const normalized = this.normalizeStatus(status);
        if (normalized === 'PRESENT') {
            return 'A';
        }
        if (normalized === 'ABSENT') {
            return 'F';
        }
        if (normalized === 'LATE') {
            return 'T';
        }
        if (normalized === 'JUSTIFIED' || normalized === 'EXCUSED') {
            return 'J';
        }
        return '';
    }

    getStatusClass(status: AssistanceStatus | ''): string {
        const normalized = this.normalizeStatus(status);
        if (normalized === 'PRESENT') {
            return 'badge light badge-success';
        }
        if (normalized === 'ABSENT') {
            return 'badge light badge-danger';
        }
        if (normalized === 'LATE') {
            return 'badge light badge-warning';
        }
        if (normalized === 'JUSTIFIED' || normalized === 'EXCUSED') {
            return 'badge light badge-info';
        }
        return 'badge light badge-secondary';
    }

    private resolveContext(): void {
        const teacherIdFromQuery = this.route.snapshot.queryParamMap.get('teacherId') || '';
        const scopeKeyFromQuery = this.route.snapshot.queryParamMap.get('scopeKey') || '';
        const teacherIdFromStorage = this.getTeacherIdFromStorage();

        this.selectedTeacherId = teacherIdFromQuery || teacherIdFromStorage || '';
        this.selectedScopeKey = scopeKeyFromQuery;
    }

    private loadTeachers(): void {
        this.teacherService.getUsers().subscribe({
            next: (teachers) => {
                this.teachers = teachers || [];
                if (!this.selectedTeacherId && this.authSession.currentRole !== 'TEACHER' && this.teachers.length > 0) {
                    this.selectedTeacherId = this.teachers[0].idTeacher;
                }
                this.rebuildScopeOptions();
            },
            error: () => {
                this.teachers = [];
                this.rebuildScopeOptions();
            }
        });
    }

    private loadStudents(): void {
        this.studentService.getUsers().subscribe({
            next: (students) => {
                this.students = students || [];
            },
            error: () => {
                this.students = [];
            }
        });
    }

    private loadAssignments(): void {
        this.loading = true;
        this.assignmentService.getTeacherSubjectAssignments().subscribe({
            next: (assignments) => {
                this.allAssignments = assignments || [];
                this.loading = false;
                this.rebuildScopeOptions();
            },
            error: () => {
                this.allAssignments = [];
                this.loading = false;
                this.rebuildScopeOptions();
            }
        });
    }

    private loadCatalogs(): void {
        this.educationLevelService.getEducationLevels().subscribe({
            next: (levels) => {
                this.educationLevels = levels || [];
                this.rebuildScopeOptions();
            },
            error: () => {
                this.educationLevels = [];
                this.rebuildScopeOptions();
            }
        });

        this.degreeService.getDegrees().subscribe({
            next: (degrees) => {
                this.degrees = degrees || [];
                this.rebuildScopeOptions();
            },
            error: () => {
                this.degrees = [];
                this.rebuildScopeOptions();
            }
        });

        this.courseService.getCourses().subscribe({
            next: (courses) => {
                this.courses = courses || [];
                this.rebuildScopeOptions();
            },
            error: () => {
                this.courses = [];
                this.rebuildScopeOptions();
            }
        });
    }

    private rebuildScopeOptions(): void {
        const teacherId = this.selectedTeacherId;
        const assignments = this.allAssignments.filter((item) => !teacherId || item.teacherId === teacherId);
        const options = new Map<string, AttendanceScopeOption>();

        assignments.forEach((assignment) => {
            const degreeId = this.resolveAssignmentDegreeId(assignment);
            const educationLevelId = this.resolveAssignmentEducationLevelId(assignment, degreeId);

            if (!degreeId || !educationLevelId) {
                return;
            }

            const levelName = this.getEducationLevelNameById(educationLevelId).toLowerCase();
            const isPrimary = levelName.includes('primaria');

            if (isPrimary) {
                const key = `${assignment.teacherId}::${educationLevelId}::${degreeId}::GRADE`;
                if (!options.has(key)) {
                    options.set(key, {
                        key,
                        teacherId: assignment.teacherId,
                        educationLevelId,
                        degreeId,
                        scopeType: 'GRADE',
                        label: `${this.getEducationLevelNameById(educationLevelId)} | ${this.getDegreeNameById(degreeId)} | Registro por grado`
                    });
                }
                return;
            }

            if (!assignment.courseId) {
                return;
            }

            const key = `${assignment.teacherId}::${educationLevelId}::${degreeId}::${assignment.courseId}::COURSE`;
            options.set(key, {
                key,
                teacherId: assignment.teacherId,
                educationLevelId,
                degreeId,
                courseId: assignment.courseId,
                scopeType: 'COURSE',
                label: `${this.getEducationLevelNameById(educationLevelId)} | ${this.getDegreeNameById(degreeId)} | ${this.getCourseNameById(assignment.courseId)}`
            });
        });

        this.scopeOptions = Array.from(options.values());

        if (!this.scopeOptions.find((item) => item.key === this.selectedScopeKey)) {
            this.selectedScopeKey = this.scopeOptions[0]?.key || '';
        }
    }

    private fetchMonthlyAttendances(startDate: string, endDate: string, onDone: (records: Assistance[]) => void): void {
        const allRecords: Assistance[] = [];

        const loadPage = (page: number): void => {
            this.assistanceService
                .getStudentAttendanceByPageable(page, undefined, startDate, endDate, undefined, 200)
                .subscribe({
                    next: (response) => {
                        const pageRecords = response?.content || [];
                        allRecords.push(...pageRecords);

                        if (response?.last || page >= ((response?.totalPages || 1) - 1)) {
                            onDone(allRecords);
                            return;
                        }

                        loadPage(page + 1);
                    },
                    error: () => {
                        this.loadingReport = false;
                        Swal.fire('Error', 'No se pudo cargar el reporte mensual de asistencias.', 'error');
                    }
                });
        };

        loadPage(0);
    }

    private buildMonthlyRows(scopedStudents: Student[], records: Assistance[], daysInMonth: number): void {
        this.monthDays = Array.from({ length: daysInMonth }, (_, idx) => idx + 1);

        const rows = new Map<string, MonthlyStudentRow>();
        scopedStudents.forEach((student) => {
            const dayMap: Record<number, AssistanceStatus | ''> = {};
            this.monthDays.forEach((day) => {
                dayMap[day] = '';
            });

            rows.set(student.idStudent || '', {
                studentId: student.idStudent || '',
                fullName: this.getStudentFullName(student),
                dni: student.user?.dni || '',
                code: student.code || '',
                statusByDay: dayMap,
                absences: 0,
                lates: 0
            });
        });

        records.forEach((record) => {
            const studentId = this.getAttendanceStudentId(record);
            if (!studentId || !rows.has(studentId)) {
                return;
            }

            const day = this.getDayFromDate(record.attendanceDate);
            if (!day || day < 1 || day > daysInMonth) {
                return;
            }

            const normalizedStatus = this.normalizeStatus(record.status);
            rows.get(studentId)!.statusByDay[day] = normalizedStatus;
        });

        const monthRows = Array.from(rows.values()).map((row) => {
            let absences = 0;
            let lates = 0;

            this.monthDays.forEach((day) => {
                const status = this.normalizeStatus(row.statusByDay[day]);
                if (status === 'ABSENT') {
                    absences += 1;
                }
                if (status === 'LATE') {
                    lates += 1;
                }
            });

            return {
                ...row,
                absences,
                lates
            };
        });

        this.monthRows = monthRows.sort((a, b) => a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase(), 'es'));
    }

    private getScopedStudents(): Student[] {
        const scope = this.currentScope;
        if (!scope) {
            return [];
        }

        return this.students.filter((student) => {
            const studentDegreeId = this.getStudentDegreeId(student);
            const studentLevelId = this.getStudentEducationLevelId(student);
            const isActive = student.status !== false;

            return (
                isActive &&
                studentDegreeId === String(scope.degreeId || '') &&
                studentLevelId === String(scope.educationLevelId || '')
            );
        });
    }

    private clearReport(): void {
        this.monthRows = [];
        this.monthDays = [];
    }

    private getTeacherIdFromStorage(): string {
        const keys = ['currentTeacherId', 'teacherId', 'idTeacher'];
        const value = keys
            .map((key) => sessionStorage.getItem(key) || localStorage.getItem(key) || '')
            .find((item) => !!item);

        return value || '';
    }

    private getCurrentMonth(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        return `${year}-${month}`;
    }

    private getMonthDateRange(month: string): { startDate: string; endDate: string; daysInMonth: number } | null {
        if (!/^\d{4}-\d{2}$/.test(month || '')) {
            return null;
        }

        const [yearRaw, monthRaw] = month.split('-');
        const year = Number(yearRaw);
        const monthNumber = Number(monthRaw);

        if (!Number.isFinite(year) || !Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
            return null;
        }

        const daysInMonth = new Date(year, monthNumber, 0).getDate();
        const startDate = `${yearRaw}-${monthRaw}-01`;
        const endDate = `${yearRaw}-${monthRaw}-${String(daysInMonth).padStart(2, '0')}`;

        return { startDate, endDate, daysInMonth };
    }

    private getStudentFullName(student: Student): string {
        return `${student.user?.lastname || ''}, ${student.user?.name || ''}`.replace(/^,\s*/, '').trim();
    }

    private getStudentDegreeId(student: any): string {
        return String(student?.idDegree || student?.degree?.idDegree || '');
    }

    private getStudentEducationLevelId(student: any): string {
        return String(student?.idEducationLevel || student?.educationLevel?.idEducationLevel || '');
    }

    private getAttendanceStudentId(record: any): string {
        return String(
            record?.studentId ||
            record?.idStudent ||
            record?.student?.idStudent ||
            ''
        );
    }

    private getDayFromDate(dateValue: string): number {
        if (!dateValue) {
            return 0;
        }

        const parts = String(dateValue).split('T')[0].split('-');
        if (parts.length !== 3) {
            return 0;
        }

        const day = Number(parts[2]);
        return Number.isFinite(day) ? day : 0;
    }

    private normalizeStatus(status: AssistanceStatus | '' | undefined): AssistanceStatus | '' {
        const normalized = String(status || '').toUpperCase();
        if (normalized === 'EXCUSED') {
            return 'JUSTIFIED';
        }
        if (normalized === 'PRESENT' || normalized === 'ABSENT' || normalized === 'LATE' || normalized === 'JUSTIFIED') {
            return normalized;
        }
        return '';
    }

    private resolveAssignmentDegreeId(assignment: TeacherSubjectAssignments): string {
        return String(assignment?.degreeId || '');
    }

    private resolveAssignmentEducationLevelId(assignment: TeacherSubjectAssignments, degreeId: string): string {
        const explicitLevelId = String(assignment?.educationLevelId || '');
        if (explicitLevelId) {
            return explicitLevelId;
        }

        if (!degreeId) {
            return '';
        }

        const degree = this.degrees.find((item) => item.idDegree === degreeId);
        return String(degree?.idEducationLevel || '');
    }
}
