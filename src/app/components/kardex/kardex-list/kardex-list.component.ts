import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { KardexService } from '../../../services/kardex.service';
import { KardexGlobalRecord, KardexGlobalResponse, STATUS_LABELS } from '../../../models/kardex';
import { AuthSessionService } from '../../../services/auth-session.service';
import { TeacherService } from '../../../services/teacher.service';
import { TeacherSubjectAssignmentsService } from '../../../services/teacherSubjectAssignments.service';
import { TeacherSubjectAssignments } from '../../../models/teacherSubjectAssignments';
import { Teacher } from '../../../models/teacher';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-kardex-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './kardex-list.component.html',
    styleUrl: './kardex-list.component.css'
})
export class KardexListComponent implements OnInit {
    private readonly kardexService = inject(KardexService);
    private readonly authSession = inject(AuthSessionService);
    private readonly teacherService = inject(TeacherService);
    private readonly assignmentsService = inject(TeacherSubjectAssignmentsService);
    private readonly router = inject(Router);

    kardexRecords: KardexGlobalRecord[] = [];
    allTeachers: Teacher[] = [];
    assignments: TeacherSubjectAssignments[] = [];
    totalPages = 0;
    currentPage = 0;
    pageSize = 10;
    loading = false;
    searchQuery = '';
    selectedDegreeCourse = '';
    selectedDegreeSection = '';
    currentTeacherId = '';
    allowedDegreeIds: string[] = [];

    readonly STATUS_LABELS = STATUS_LABELS;

    get isTeacherRole(): boolean {
        return this.authSession.currentRole === 'TEACHER';
    }

    get isAdminRole(): boolean {
        return this.authSession.currentRole === 'ADMIN';
    }

    ngOnInit(): void {
        this.resolveTeacherContext();
        this.loadTeachers();
        this.loadAssignments();
        this.loadKardex(0);
    }

    loadKardex(page: number): void {
        this.loading = true;
        this.kardexService.getGlobalKardex(page, this.pageSize).subscribe({
            next: (response: KardexGlobalResponse) => {
                this.kardexRecords = response.content;
                this.totalPages = response.totalPages;
                this.currentPage = response.currentPage;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando Kardex', err);
                this.loading = false;
                Swal.fire('Error', 'No se pudo cargar el Kardex', 'error');
            }
        });
    }

    get isTeacherViewRestricted(): boolean {
        return this.isTeacherRole && this.allowedDegreeIds.length > 0;
    }

    viewDetail(record: KardexGlobalRecord): void {
        const fallbackDni = this.extractDniFromStudentCode(record.studentCode);
        const dni = String(record.studentDni || '').trim() || fallbackDni;

        if (!dni) {
            Swal.fire('Error', 'DNI del estudiante no disponible', 'error');
            return;
        }

        this.router.navigate(['/admin/kardex/detail'], {
            queryParams: { dni }
        });
    }

    private extractDniFromStudentCode(studentCode: string): string {
        const rawCode = String(studentCode || '').trim();
        if (!rawCode) {
            return '';
        }
        const match = rawCode.match(/(\d{8})$/);
        return match ? match[1] : '';
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages - 1) {
            this.loadKardex(this.currentPage + 1);
        }
    }

    prevPage(): void {
        if (this.currentPage > 0) {
            this.loadKardex(this.currentPage - 1);
        }
    }

    goToPage(page: number): void {
        if (page >= 0 && page < this.totalPages) {
            this.loadKardex(page);
        }
    }

    getGradesPreview(record: KardexGlobalRecord): string {
        const summary = record.gradesSummary as any[];
        if (!Array.isArray(summary) || summary.length === 0) {
            return 'Sin notas';
        }
        return summary.map(s => `T${s.term}: ${s.grade}`).join(', ');
    }

    get filteredRecords(): KardexGlobalRecord[] {
        const onlyStudents = this.kardexRecords.filter((r) =>
            !!r.studentId && !!r.studentDni && !!r.studentFullName && !!r.degreeId && !!r.educationLevelId
        );

        let result = onlyStudents;

        if (this.isTeacherRole) {
            if (this.allowedDegreeIds.length === 0) {
                return [];
            }

            result = result.filter((record) => this.allowedDegreeIds.includes(String(record.degreeId || '').trim()));
        }

        if (this.selectedDegreeCourse) {
            result = result.filter(
                (r) => String(r.degreeCourse || '').trim().toUpperCase() === this.selectedDegreeCourse
            );
        }

        if (this.selectedDegreeSection) {
            result = result.filter(
                (r) => String(r.degreeSection || '').trim().toUpperCase() === this.selectedDegreeSection
            );
        }

        if (!this.searchQuery.trim()) {
            return result;
        }

        const query = this.searchQuery.toLowerCase();
        return result.filter(r =>
            r.studentFullName.toLowerCase().includes(query) ||
            r.studentCode.includes(query) ||
            r.studentDni.includes(query) ||
            r.studentEmail.toLowerCase().includes(query) ||
            String(r.degreeCourse || '').toLowerCase().includes(query) ||
            String(r.degreeSection || '').toLowerCase().includes(query)
        );
    }

    get availableDegreeCourses(): string[] {
        return Array.from(
            new Set(
                this.kardexRecords
                    .map((r) => String(r.degreeCourse || '').trim().toUpperCase())
                    .filter((value) => !!value)
            )
        ).sort((a, b) => a.localeCompare(b, 'es'));
    }

    get availableDegreeSections(): string[] {
        const source = this.selectedDegreeCourse
            ? this.kardexRecords.filter(
                (r) => String(r.degreeCourse || '').trim().toUpperCase() === this.selectedDegreeCourse
            )
            : this.kardexRecords;

        return Array.from(
            new Set(
                source
                    .map((r) => String(r.degreeSection || '').trim().toUpperCase())
                    .filter((value) => !!value)
            )
        ).sort((a, b) => a.localeCompare(b, 'es'));
    }

    onDegreeCourseChange(value: string): void {
        this.selectedDegreeCourse = String(value || '').trim().toUpperCase();

        // Limpia sección si ya no aplica al nuevo grado seleccionado.
        if (
            this.selectedDegreeSection &&
            !this.availableDegreeSections.includes(this.selectedDegreeSection)
        ) {
            this.selectedDegreeSection = '';
        }
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedDegreeCourse = '';
        this.selectedDegreeSection = '';
    }

    private resolveTeacherContext(): void {
        const currentUser = this.authSession.currentUser;
        const userId = String(currentUser?.id || '').trim();
        const email = String(currentUser?.email || '').trim().toLowerCase();

        if (!this.isTeacherRole || (!userId && !email)) {
            return;
        }

        this.currentTeacherId = this.findTeacherIdByUserIdentity(userId, email);
    }

    private loadTeachers(): void {
        this.teacherService.getUsers().subscribe({
            next: (response) => {
                this.allTeachers = response || [];

                if (this.isTeacherRole && !this.currentTeacherId) {
                    const currentUser = this.authSession.currentUser;
                    const userId = String(currentUser?.id || '').trim();
                    const email = String(currentUser?.email || '').trim().toLowerCase();
                    this.currentTeacherId = this.findTeacherIdByUserIdentity(userId, email);
                }

                this.refreshAllowedDegreeIds();
            },
            error: () => {
                this.allTeachers = [];
                this.refreshAllowedDegreeIds();
            }
        });
    }

    private loadAssignments(): void {
        this.assignmentsService.getTeacherSubjectAssignments().subscribe({
            next: (response) => {
                this.assignments = response || [];
                this.refreshAllowedDegreeIds();
            },
            error: () => {
                this.assignments = [];
                this.refreshAllowedDegreeIds();
            }
        });
    }

    private refreshAllowedDegreeIds(): void {
        if (!this.isTeacherRole || !this.currentTeacherId) {
            this.allowedDegreeIds = [];
            return;
        }

        this.allowedDegreeIds = Array.from(
            new Set(
                this.assignments
                    .filter((assignment) => String(assignment.teacherId || '').trim() === this.currentTeacherId)
                    .map((assignment) => String(assignment.degreeId || '').trim())
                    .filter((degreeId) => !!degreeId)
            )
        );
    }

    private findTeacherIdByUserIdentity(userId: string, email: string): string {
        const teacher = this.allTeachers.find((item) => {
            const teacherUserId = String(item.user?.idUser || '').trim();
            const teacherEmail = String(item.user?.email || '').trim().toLowerCase();

            if (userId && teacherUserId === userId) {
                return true;
            }

            return !!email && teacherEmail === email;
        });

        return teacher?.idTeacher || '';
    }

    goBack(): void {
        this.router.navigate(['/admin']);
    }
}
