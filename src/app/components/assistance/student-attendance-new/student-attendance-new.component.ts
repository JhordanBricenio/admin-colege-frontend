import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import {
    AssistanceStatus,
    StudentAttendanceBulkCreateRequest,
    StudentAttendanceBulkRecord
} from '../../../models/assistance';
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

interface DailyStudentAttendanceRow {
    studentId: string;
    fullName: string;
    dni: string;
    code: string;
    status: AssistanceStatus;
    minutesLate: number;
    justification: string;
    source: string;
}

@Component({
    selector: 'app-student-attendance-new',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './student-attendance-new.component.html',
    styleUrl: './student-attendance-new.component.css'
})
export class StudentAttendanceNewComponent {

    private readonly assistanceService = inject(AssistanceService);
    private readonly studentService = inject(StudentService);
    private readonly teacherService = inject(TeacherService);
    private readonly assignmentService = inject(TeacherSubjectAssignmentsService);
    private readonly educationLevelService = inject(EducationLevelService);
    private readonly degreeService = inject(DegreeService);
    private readonly courseService = inject(CourseService);
    readonly authSession = inject(AuthSessionService);
    private readonly route = inject(ActivatedRoute);

    readonly statusOptions: Array<{ value: AssistanceStatus; label: string }> = [
        { value: 'PRESENT', label: 'Asistio' },
        { value: 'ABSENT', label: 'Falto' },
        { value: 'LATE', label: 'Tardanza' },
        { value: 'EXCUSED', label: 'Justificado' }
    ];

    readonly todayDate = this.getTodayDate();

    loading = false;
    saving = false;

    selectedTeacherId = '';
    selectedScopeKey = '';
    attendanceDate = this.todayDate;
    session = 'Mañana';
    conflictStrategy = 'SKIP';

    teachers: Teacher[] = [];
    allAssignments: TeacherSubjectAssignments[] = [];
    scopeOptions: AttendanceScopeOption[] = [];
    dailyRows: DailyStudentAttendanceRow[] = [];

    students: Student[] = [];
    educationLevels: EducationLevel[] = [];
    degrees: Degree[] = [];
    courses: Course[] = [];

    ngOnInit(): void {
        this.resolveTeacherContext();
        this.loadCatalogs();
        this.loadTeachers();
        this.loadStudents();
        this.loadAssignments();
    }

    get currentRoleLabel(): string {
        return this.authSession.currentRole === 'TEACHER' ? 'Docente' : 'Administrador';
    }

    get currentScope(): AttendanceScopeOption | null {
        return this.scopeOptions.find((item) => item.key === this.selectedScopeKey) || null;
    }

    get isPrimaryScope(): boolean {
        const scope = this.currentScope;
        if (!scope) {
            return false;
        }
        const levelName = this.getEducationLevelNameById(scope.educationLevelId).toLowerCase();
        return levelName.includes('primaria');
    }

    get selectedTeacherName(): string {
        const teacher = this.teachers.find((item) => item.idTeacher === this.selectedTeacherId);
        if (!teacher) {
            return '';
        }
        return `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim();
    }

    onTeacherChange(teacherId: string): void {
        this.selectedTeacherId = teacherId;
        if (teacherId) {
            sessionStorage.setItem('currentTeacherId', teacherId);
        }
        this.rebuildScopeOptions();
        this.rebuildDailyRows();
    }

    onScopeChange(scopeKey: string): void {
        this.selectedScopeKey = scopeKey;
        this.rebuildDailyRows();
    }

    applyStatusToAll(status: AssistanceStatus): void {
        this.dailyRows = this.dailyRows.map((row) => ({ ...row, status }));
    }

    resetRows(): void {
        this.rebuildDailyRows();
    }

    saveDailyAttendance(): void {
        if (!this.isToday(this.attendanceDate)) {
            this.attendanceDate = this.todayDate;
            Swal.fire('Atencion', 'La fecha del registro debe ser el dia actual.', 'warning');
            return;
        }

        if (!this.selectedScopeKey) {
            Swal.fire('Atencion', 'Selecciona un curso o grado para registrar asistencia.', 'warning');
            return;
        }

        if (this.dailyRows.length === 0) {
            Swal.fire('Atencion', 'No hay alumnos para registrar en el contexto seleccionado.', 'warning');
            return;
        }

        const payload = this.mapDailyBulkPayload();
        const duplicated = this.findDuplicatedStudent(payload.records);
        if (duplicated) {
            Swal.fire('Atencion', `El alumno ${duplicated} aparece duplicado en la lista.`, 'warning');
            return;
        }

        this.saving = true;
        this.assistanceService.createStudentAttendanceBulk(payload).subscribe({
            next: () => {
                this.saving = false;
                Swal.fire('Exito', 'Asistencia diaria registrada correctamente', 'success');
            },
            error: () => {
                this.saving = false;
                Swal.fire('Error', 'No se pudo registrar la asistencia diaria. Revisa duplicados o conflictos en backend.', 'error');
            }
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

    getScopeTypeLabel(option: AttendanceScopeOption): string {
        return option.scopeType === 'GRADE' ? 'Registro por grado' : 'Registro por curso';
    }

    private resolveTeacherContext(): void {
        const teacherIdFromQuery = this.route.snapshot.queryParamMap.get('teacherId') || '';
        const teacherIdFromStorage = this.getTeacherIdFromStorage();
        this.selectedTeacherId = teacherIdFromQuery || teacherIdFromStorage || '';
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
                this.rebuildDailyRows();
            },
            error: () => {
                this.students = [];
                this.rebuildDailyRows();
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

        this.rebuildDailyRows();
    }

    private rebuildDailyRows(): void {
        const scope = this.currentScope;
        if (!scope) {
            this.dailyRows = [];
            return;
        }

        const filteredStudents = this.students
            .filter((student) => {
                const studentDegreeId = this.getStudentDegreeId(student);
                const studentLevelId = this.getStudentEducationLevelId(student);
                const isActive = student.status !== false;

                return (
                    isActive &&
                    studentDegreeId === String(scope.degreeId || '') &&
                    studentLevelId === String(scope.educationLevelId || '')
                );
            })
            .sort((a, b) => {
                const aName = this.getStudentFullName(a).toLowerCase();
                const bName = this.getStudentFullName(b).toLowerCase();
                return aName.localeCompare(bName, 'es');
            });

        this.dailyRows = filteredStudents.map((student) => ({
            studentId: student.idStudent || '',
            fullName: this.getStudentFullName(student),
            dni: student.user?.dni || '',
            code: student.code || '',
            status: 'PRESENT' as AssistanceStatus,
            minutesLate: 0,
            justification: '',
            source: 'web-admin'
        }));
    }

    private mapDailyBulkPayload(): StudentAttendanceBulkCreateRequest {
        const records: StudentAttendanceBulkRecord[] = this.dailyRows.map((row) => ({
            studentId: row.studentId,
            status: row.status,
            minutesLate: Number(row.minutesLate ?? 0),
            justification: row.justification || '',
            source: row.source || 'web-admin'
        }));

        return {
            date: this.attendanceDate,
            session: this.session || 'Mañana',
            conflictStrategy: this.conflictStrategy || 'SKIP',
            records
        };
    }

    private findDuplicatedStudent(records: StudentAttendanceBulkRecord[]): string {
        const counter = new Map<string, number>();
        for (const item of records) {
            const key = (item.studentId || '').trim();
            if (!key) {
                continue;
            }
            counter.set(key, (counter.get(key) || 0) + 1);
            if ((counter.get(key) || 0) > 1) {
                const row = this.dailyRows.find((student) => student.studentId === key);
                return row?.fullName || key;
            }
        }
        return '';
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

    private getTeacherIdFromStorage(): string {
        const keys = ['currentTeacherId', 'teacherId', 'idTeacher'];
        const value = keys
            .map((key) => sessionStorage.getItem(key) || localStorage.getItem(key) || '')
            .find((item) => !!item);

        return value || '';
    }

    private isToday(dateValue: string): boolean {
        return dateValue === this.todayDate;
    }

    private getTodayDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const day = `${now.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
