import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { KardexService } from '../../../services/kardex.service';
import {
    KardexStudentResponse,
    KardexYearRecord,
    KardexCourseRecord,
    STATUS_LABELS,
    STATUS_COLORS,
    BIMESTER_LABELS
} from '../../../models/kardex';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-kardex-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './kardex-detail.component.html',
    styleUrl: './kardex-detail.component.css'
})
export class KardexDetailComponent implements OnInit {
    private readonly kardexService = inject(KardexService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    kardex: KardexStudentResponse | null = null;
    loading = false;
    dni = '';

    readonly STATUS_LABELS = STATUS_LABELS;
    readonly STATUS_COLORS = STATUS_COLORS;
    readonly BIMESTER_LABELS = BIMESTER_LABELS;

    ngOnInit(): void {
        this.dni = this.route.snapshot.queryParamMap.get('dni') || '';
        if (this.dni) {
            this.loadKardex();
        } else {
            Swal.fire('Error', 'DNI no proporcionado', 'error').then(() => this.router.navigate(['/admin/kardex']));
        }
    }

    loadKardex(): void {
        if (!this.dni) return;

        this.loading = true;
        this.kardexService.getStudentKardexByDni(this.dni).subscribe({
            next: (response) => {
                console.log('Kardex cargado:', response);
                this.kardex = response;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando detalle Kardex:', err);
                this.loading = false;
                Swal.fire('Error', 'No se pudo cargar el Kardex del estudiante', 'error');
            }
        });
    }

    getStatusBadgeClass(status: string): string {
        const colorMap: Record<string, string> = {
            APPROVED: 'bg-success',
            FAILED: 'bg-danger',
            IN_PROGRESS: 'bg-warning text-dark',
            WITHDRAWN: 'bg-secondary'
        };
        return colorMap[status] || 'bg-secondary';
    }

    getGradeColor(grade: number | null): string {
        if (grade === null) return 'text-muted';
        if (grade >= 18) return 'text-success fw-bold';
        if (grade >= 14) return 'text-primary fw-bold';
        if (grade >= 11) return 'text-warning fw-bold';
        return 'text-danger fw-bold';
    }

    calculateCourseCompletion(course: KardexCourseRecord): number {
        const terms = Object.values(course.termGrades).filter(g => g !== null);
        return Math.round((terms.length / 4) * 100);
    }

    getDniFromCode(code: string): string {
        const raw = String(code || '').trim();
        if (!raw) {
            return '';
        }

        // Ejemplo: AR74379877 -> 74379877
        const numericPart = raw.split(/[^0-9]+/).join('');
        return numericPart.slice(-8);
    }

    getStudentDni(): string {
        if (!this.kardex?.student) return '';
        return this.kardex.student.studentDni || this.kardex.student.dni || this.getDniFromCode(this.kardex.student.code);
    }

    getAcademicLabel(): string {
        if (!this.kardex?.student) return '';
        const level = this.kardex.student.educationLevelName || '';
        const course = this.kardex.student.degreeCourse || '';
        const section = this.kardex.student.degreeSection || '';

        const parts = [level, course].filter(Boolean);
        const base = parts.join(' - ');
        if (!base && !section) return '';
        return section ? `${base} ${section}`.trim() : base;
    }

    goBack(): void {
        this.router.navigate(['/admin/kardex']);
    }

    downloadKardex(): void {
        if (!this.kardex) return;

        // Aquí puedes implementar descarga de PDF si lo necesitas
        Swal.fire('Info', 'Función de descarga no implementada aún', 'info');
    }

    printKardex(): void {
        window.print();
    }
}
