import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Assistance, AssistancePageResponse, AssistanceStatus } from '../../../models/assistance';
import { Teacher } from '../../../models/teacher';
import { AssistanceService } from '../../../services/assistance.service';
import { TeacherService } from '../../../services/teacher.service';

@Component({
    selector: 'app-teacher-attendance-index',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './teacher-attendance-index.component.html',
    styleUrl: './teacher-attendance-index.component.css'
})
export class TeacherAttendanceIndexComponent {

    private readonly route = inject(ActivatedRoute);
    private readonly assistanceService = inject(AssistanceService);
    private readonly teacherService = inject(TeacherService);

    records: Assistance[] = [];
    pagination: AssistancePageResponse | null = null;
    page = 0;
    pages: number[] = [];

    allTeachers: Teacher[] = [];
    teacherSearchText = '';
    teacherIdFilter = '';
    startDateFilter = '';
    endDateFilter = '';
    statusFilter: AssistanceStatus | '' = '';
    loading = false;
    filterWarning = '';

    readonly statusOptions: Array<{ value: AssistanceStatus; label: string }> = [
        { value: 'PRESENT', label: 'Asistio' },
        { value: 'ABSENT', label: 'Falto' },
        { value: 'LATE', label: 'Tardanza' },
        { value: 'EXCUSED', label: 'Justificado' }
    ];

    ngOnInit(): void {
        const today = this.getTodayDate();
        this.startDateFilter = today;
        this.endDateFilter = today;

        this.loadTeachers();

        this.route.paramMap.subscribe((params) => {
            const pageParam = params.get('page');
            this.page = pageParam !== null ? +pageParam : 0;
            if (isNaN(this.page) || this.page < 0) {
                this.page = 0;
            }
            this.loadData(this.page);
        });
    }

    applyFilters(): void {
        this.filterWarning = '';
        this.teacherIdFilter = this.resolveTeacherIdFromSearch(this.teacherSearchText);

        if (this.teacherSearchText.trim() && !this.teacherIdFilter) {
            this.filterWarning = 'No se encontro un docente para el nombre o DNI ingresado.';
            this.records = [];
            this.pagination = null;
            this.pages = [];
            return;
        }

        this.loadData(0);
    }

    clearFilters(): void {
        this.teacherSearchText = '';
        this.teacherIdFilter = '';
        const today = this.getTodayDate();
        this.startDateFilter = today;
        this.endDateFilter = today;
        this.statusFilter = '';
        this.filterWarning = '';
        this.loadData(0);
    }

    getTeacherDisplayNameById(teacherId: string): string {
        const teacher = this.allTeachers.find((item) => item.idTeacher === teacherId);
        if (teacher) {
            const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim();
            return fullName || 'Docente sin nombre';
        }
        return 'Docente no encontrado';
    }

    onTeacherSearch(value: string): void {
        this.teacherSearchText = value;
        this.teacherIdFilter = this.resolveTeacherIdFromSearch(value);
    }

    getStatusLabel(status: string): string {
        const normalized = (status || '').toUpperCase();
        if (normalized === 'PRESENT') {
            return 'Asistio';
        }
        if (normalized === 'ABSENT') {
            return 'Falto';
        }
        if (normalized === 'LATE') {
            return 'Tardanza';
        }
        if (normalized === 'EXCUSED') {
            return 'Justificado';
        }
        return status || '-';
    }

    getStatusBadgeClass(status: string): string {
        const normalized = (status || '').toUpperCase();
        if (normalized === 'PRESENT') {
            return 'badge light badge-success';
        }
        if (normalized === 'ABSENT') {
            return 'badge light badge-danger';
        }
        if (normalized === 'LATE') {
            return 'badge light badge-warning';
        }
        if (normalized === 'EXCUSED') {
            return 'badge light badge-info';
        }
        return 'badge light badge-secondary';
    }

    trackByAttendanceId(index: number, item: Assistance): string {
        return item.idAttendance || `${item.teacherId}-${item.attendanceDate}-${index}`;
    }

    private loadData(page: number): void {
        this.loading = true;
        this.assistanceService
            .getTeacherAttendanceByPageable(
                page,
                this.teacherIdFilter || undefined,
                this.startDateFilter || undefined,
                this.endDateFilter || undefined,
                this.statusFilter || undefined
            )
            .subscribe({
                next: (response) => {
                    this.records = response?.content || [];
                    this.pagination = response;
                    this.page = response?.number ?? page;
                    this.buildPages();
                    this.loading = false;
                },
                error: () => {
                    this.records = [];
                    this.pagination = null;
                    this.pages = [];
                    this.loading = false;
                }
            });
    }

    private loadTeachers(): void {
        this.teacherService.getUsers().subscribe({
            next: (teachers) => {
                this.allTeachers = teachers || [];
            },
            error: () => {
                this.allTeachers = [];
            }
        });
    }

    private resolveTeacherIdFromSearch(value: string): string {
        const search = (value || '').trim().toLowerCase();
        if (!search) {
            return '';
        }

        const byId = this.allTeachers.find((teacher) => (teacher.idTeacher || '').toLowerCase() === search);
        if (byId?.idTeacher) {
            return byId.idTeacher;
        }

        const exactMatch = this.allTeachers.find((teacher) => {
            const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim().toLowerCase();
            const dni = (teacher.user?.dni || '').toLowerCase();
            return fullName === search || dni === search;
        });

        if (exactMatch?.idTeacher) {
            return exactMatch.idTeacher;
        }

        const partialMatch = this.allTeachers.find((teacher) => {
            const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim().toLowerCase();
            const dni = (teacher.user?.dni || '').toLowerCase();
            return fullName.includes(search) || dni.includes(search);
        });

        return partialMatch?.idTeacher || '';
    }

    private buildPages(): void {
        const totalPages = this.pagination?.totalPages ?? 0;
        const currentPage = this.pagination?.number ?? 0;

        if (totalPages <= 0) {
            this.pages = [];
            return;
        }

        let start = Math.max(0, currentPage - 2);
        let end = Math.min(totalPages - 1, start + 4);
        start = Math.max(0, Math.min(start, end - 4));

        this.pages = [];
        for (let page = start; page <= end; page++) {
            this.pages.push(page);
        }
    }

    private getTodayDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const day = `${now.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
