import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AssistanceStatus, TeacherAttendanceBulkCreateRequest, TeacherAttendanceBulkRecord, TeacherAttendanceCreateRequest } from '../../../models/assistance';
import { Teacher } from '../../../models/teacher';
import { AssistanceService } from '../../../services/assistance.service';
import { TeacherService } from '../../../services/teacher.service';

@Component({
    selector: 'app-teacher-attendance-new',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './teacher-attendance-new.component.html',
    styleUrl: './teacher-attendance-new.component.css'
})
export class TeacherAttendanceNewComponent {

    private readonly fb = inject(FormBuilder);
    private readonly assistanceService = inject(AssistanceService);
    private readonly teacherService = inject(TeacherService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    readonly modeOptions = [
        { value: 'single', label: 'Registro individual' },
        { value: 'bulk', label: 'Registro masivo' }
    ] as const;

    mode: 'single' | 'bulk' = 'single';
    isEditMode = false;
    editingAttendanceId = '';
    saving = false;
    teachers: Teacher[] = [];

    readonly statusOptions: Array<{ value: AssistanceStatus; label: string }> = [
        { value: 'PRESENT', label: 'Asistio' },
        { value: 'ABSENT', label: 'Falto' },
        { value: 'LATE', label: 'Tardanza' },
        { value: 'JUSTIFIED', label: 'Justificado' }
    ];

    singleTeacherSearchText = '';

    form = this.fb.group({
        teacherId: ['', Validators.required],
        attendanceDate: ['', Validators.required],
        minutesLate: [0, [Validators.required, Validators.min(0)]],
        session: ['Mañana', Validators.required],
        status: ['PRESENT' as AssistanceStatus, Validators.required],
        justification: [''],
        source: ['web-admin', Validators.required]
    });

    bulkForm = this.fb.group({
        date: ['', Validators.required],
        session: ['Mañana', Validators.required],
        conflictStrategy: ['SKIP', Validators.required],
        records: this.fb.array([])
    });

    bulkTeacherSearch: string[] = [];

    ngOnInit(): void {
        const today = this.getTodayDate();
        this.form.patchValue({ attendanceDate: today });
        this.bulkForm.patchValue({ date: today });

        this.loadTeachers();
        this.addBulkRow();

        this.route.paramMap.subscribe((params) => {
            const idAttendance = params.get('idAttendance') || '';
            if (!idAttendance) {
                return;
            }

            this.isEditMode = true;
            this.editingAttendanceId = idAttendance;
            this.mode = 'single';
            this.loadAttendanceForEdit(idAttendance);
        });
    }

    get recordsArray(): FormArray {
        return this.bulkForm.get('records') as FormArray;
    }

    getTeacherNameById(teacherId: string): string {
        const teacher = this.teachers.find((item) => item.idTeacher === teacherId);
        if (!teacher) {
            return '';
        }
        return `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim();
    }

    getTeacherDisplay(teacher: Teacher): string {
        const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim();
        const dni = teacher.user?.dni || 'Sin DNI';
        return `${fullName || 'Sin nombre'} - DNI: ${dni}`;
    }

    getTeacherFullName(teacher: Teacher): string {
        return `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim();
    }

    get selectedTeacher(): Teacher | null {
        const teacherId = this.form.get('teacherId')?.value || '';
        if (!teacherId) {
            return null;
        }
        return this.teachers.find((item) => item.idTeacher === teacherId) || null;
    }

    get selectedTeacherName(): string {
        const teacher = this.selectedTeacher;
        if (!teacher) {
            return '';
        }
        return `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim();
    }

    get selectedTeacherDni(): string {
        return this.selectedTeacher?.user?.dni || '';
    }

    get selectedTeacherEmail(): string {
        return this.selectedTeacher?.user?.email || '';
    }

    get selectedTeacherPhone(): string {
        return this.selectedTeacher?.user?.phone || '';
    }

    onSingleTeacherSearch(value: string): void {
        this.singleTeacherSearchText = value;
        const resolvedTeacherId = this.resolveTeacherId(value);
        this.form.patchValue({ teacherId: resolvedTeacherId });
    }

    onBulkTeacherSearch(rowIndex: number, value: string): void {
        this.bulkTeacherSearch[rowIndex] = value;
        const resolvedTeacherId = this.resolveTeacherId(value);
        this.recordsArray.at(rowIndex).patchValue({ teacherId: resolvedTeacherId });
    }

    addBulkRow(): void {
        this.recordsArray.push(this.fb.group({
            teacherId: ['', Validators.required],
            minutesLate: [0, [Validators.required, Validators.min(0)]],
            status: ['PRESENT' as AssistanceStatus, Validators.required],
            justification: [''],
            source: ['web-admin', Validators.required]
        }));
        this.bulkTeacherSearch.push('');
    }

    removeBulkRow(index: number): void {
        if (this.recordsArray.length <= 1) {
            return;
        }
        this.recordsArray.removeAt(index);
        this.bulkTeacherSearch.splice(index, 1);
    }

    submitSingle(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload = this.mapSinglePayload();
        this.saving = true;

        if (this.isEditMode && this.editingAttendanceId) {
            this.assistanceService.updateTeacherAttendance(this.editingAttendanceId, payload).subscribe({
                next: () => {
                    this.saving = false;
                    Swal.fire('Exito', 'Asistencia actualizada correctamente', 'success');
                    this.router.navigate(['/admin/teacher-attendance']);
                },
                error: () => {
                    this.saving = false;
                    Swal.fire('Error', 'No se pudo actualizar la asistencia docente.', 'error');
                }
            });
            return;
        }

        this.assistanceService.createTeacherAttendance(payload).subscribe({
            next: () => {
                this.saving = false;
                Swal.fire('Exito', 'Asistencia registrada correctamente', 'success');
                this.router.navigate(['/admin/teacher-attendance']);
            },
            error: (errorResponse) => {
                this.saving = false;
                const attendanceId = this.extractAttendanceIdFromError(errorResponse);
                if (attendanceId) {
                    Swal.fire({
                        title: 'Registro ya existe',
                        text: 'Ya existe asistencia para ese docente y fecha. Deseas editar ese registro?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Si, editar',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.router.navigate(['/admin/teacher-attendance/edit', attendanceId]);
                        }
                    });
                    return;
                }

                Swal.fire('Error', 'No se pudo registrar la asistencia. Verifica si ya existe un registro para ese docente y fecha.', 'error');
            }
        });
    }

    submitBulk(): void {
        if (this.bulkForm.invalid || this.recordsArray.length === 0) {
            this.bulkForm.markAllAsTouched();
            this.recordsArray.controls.forEach((ctrl) => ctrl.markAllAsTouched());
            return;
        }

        const payload = this.mapBulkPayload();
        const duplicate = this.findDuplicatedTeacher(payload.records);
        if (duplicate) {
            Swal.fire('Atencion', `El docente ${duplicate} esta repetido en el envio masivo para la misma fecha.`, 'warning');
            return;
        }

        this.saving = true;
        this.assistanceService.createTeacherAttendanceBulk(payload).subscribe({
            next: () => {
                this.saving = false;
                Swal.fire('Exito', 'Asistencia masiva registrada correctamente', 'success');
                this.router.navigate(['/admin/teacher-attendance']);
            },
            error: () => {
                this.saving = false;
                Swal.fire('Error', 'No se pudo registrar la asistencia masiva. Verifica duplicados en backend.', 'error');
            }
        });
    }

    private mapSinglePayload(): TeacherAttendanceCreateRequest {
        const raw = this.form.getRawValue();
        return {
            teacherId: raw.teacherId || '',
            attendanceDate: raw.attendanceDate || '',
            minutesLate: Number(raw.minutesLate ?? 0),
            session: raw.session || 'Mañana',
            status: (raw.status || 'PRESENT') as AssistanceStatus,
            justification: raw.justification || '',
            source: raw.source || 'web-admin'
        };
    }

    private mapBulkPayload(): TeacherAttendanceBulkCreateRequest {
        const rawBulk = this.bulkForm.getRawValue();
        const records: TeacherAttendanceBulkRecord[] = this.recordsArray.controls.map((control) => {
            const row = control.getRawValue();
            return {
                teacherId: row.teacherId || '',
                minutesLate: Number(row.minutesLate ?? 0),
                status: (row.status || 'PRESENT') as AssistanceStatus,
                justification: row.justification || '',
                source: row.source || 'web-admin'
            };
        });

        return {
            date: rawBulk.date || '',
            session: rawBulk.session || 'Mañana',
            conflictStrategy: rawBulk.conflictStrategy || 'SKIP',
            records
        };
    }

    private findDuplicatedTeacher(records: TeacherAttendanceBulkRecord[]): string {
        const counter = new Map<string, number>();
        for (const item of records) {
            const key = (item.teacherId || '').trim();
            if (!key) {
                continue;
            }
            counter.set(key, (counter.get(key) || 0) + 1);
            if ((counter.get(key) || 0) > 1) {
                return this.getTeacherNameById(key) || key;
            }
        }
        return '';
    }

    private resolveTeacherId(value: string): string {
        const search = (value || '').trim().toLowerCase();
        if (!search) {
            return '';
        }

        const byId = this.teachers.find((teacher) => (teacher.idTeacher || '').toLowerCase() === search);
        if (byId?.idTeacher) {
            return byId.idTeacher;
        }

        const exact = this.teachers.find((teacher) => {
            const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim().toLowerCase();
            const dni = (teacher.user?.dni || '').toLowerCase();
            return fullName === search || dni === search;
        });

        if (exact?.idTeacher) {
            return exact.idTeacher;
        }

        const partial = this.teachers.find((teacher) => {
            const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim().toLowerCase();
            const dni = (teacher.user?.dni || '').toLowerCase();
            return fullName.includes(search) || dni.includes(search);
        });

        return partial?.idTeacher || '';
    }

    private loadTeachers(): void {
        this.teacherService.getUsers().subscribe({
            next: (teachers) => {
                this.teachers = teachers || [];
            },
            error: () => {
                this.teachers = [];
            }
        });
    }

    private loadAttendanceForEdit(idAttendance: string): void {
        this.assistanceService.getTeacherAttendanceById(idAttendance).subscribe({
            next: (attendance) => {
                this.form.patchValue({
                    teacherId: attendance.teacherId || '',
                    attendanceDate: attendance.attendanceDate || this.getTodayDate(),
                    minutesLate: Number(attendance.minutesLate ?? 0),
                    session: attendance.session || 'Mañana',
                    status: (attendance.status || 'PRESENT') as AssistanceStatus,
                    justification: attendance.justification || '',
                    source: attendance.source || 'web-admin'
                });

                const teacherName = attendance.teacherName || this.getTeacherNameById(attendance.teacherId || '');
                const teacherDni = attendance.teacherDni || this.getTeacherDniById(attendance.teacherId || '');
                this.singleTeacherSearchText = teacherDni ? `${teacherName} (${teacherDni})` : teacherName;
            },
            error: () => {
                Swal.fire('Error', 'No se pudo cargar el registro de asistencia a editar.', 'error');
                this.router.navigate(['/admin/teacher-attendance']);
            }
        });
    }

    private getTeacherDniById(teacherId: string): string {
        const teacher = this.teachers.find((item) => item.idTeacher === teacherId);
        return teacher?.user?.dni || '';
    }

    private extractAttendanceIdFromError(errorResponse: any): string {
        const errorBody = errorResponse?.error;
        return (
            errorBody?.idAttendance ||
            errorBody?.attendanceId ||
            errorBody?.data?.idAttendance ||
            errorBody?.data?.attendanceId ||
            ''
        );
    }

    private getTodayDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const day = `${now.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
