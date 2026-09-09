import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegistrationService } from '../../../services/registration.service';
import { AuthSessionService } from '../../../services/auth-session.service';
import { TeacherService } from '../../../services/teacher.service';
import { TeacherSubjectAssignmentsService } from '../../../services/teacherSubjectAssignments.service';
import { TeacherSubjectAssignments } from '../../../models/teacherSubjectAssignments';
import { Teacher } from '../../../models/teacher';
import Swal from 'sweetalert2';
import { RegistrationDTO } from '../../../models/registrationDTO';
import { PaginatorComponent } from '../../paginator/paginator.component';



@Component({
  selector: 'app-registration-index',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, RouterModule, FormsModule, DatePipe, PaginatorComponent],
  templateUrl: './registration-index.component.html',
  styleUrl: './registration-index.component.css'
})
export class RegistrationIndexComponent implements OnInit {


  private registrationService = inject(RegistrationService);
  private authSession = inject(AuthSessionService);
  private teacherService = inject(TeacherService);
  private assignmentsService = inject(TeacherSubjectAssignmentsService);
  private route = inject(ActivatedRoute);

  registrations: RegistrationDTO[] = [];
  filteredRegistrations: RegistrationDTO[] = [];
  allTeachers: Teacher[] = [];
  assignments: TeacherSubjectAssignments[] = [];
  searchTerm: string = '';
  filterStatus: string = 'ALL';
  page: number | null = 0;
  pagination: any;
  isLoading = false;
  currentTeacherId = '';
  allowedDegreeIds: string[] = [];
  sessionTeacherMissing = false;

  get isTeacherRole(): boolean {
    return this.authSession.currentRole === 'TEACHER';
  }

  get isAdminRole(): boolean {
    return this.authSession.currentRole === 'ADMIN';
  }

  get isTeacherRestricted(): boolean {
    return this.isTeacherRole && this.allowedDegreeIds.length > 0;
  }

  ngOnInit(): void {
    this.resolveTeacherContext();
    this.loadTeachers();
    this.loadAssignments();
    this.route.paramMap.subscribe(params => {
      const pageParam = params.get('page');
      this.page = pageParam !== null ? +pageParam : 0;
      if (isNaN(this.page as number)) {
        this.page = 0;
      }
      this.loadRegistrations(this.page as number);
    });
  }

  loadRegistrations(page: number): void {
    this.isLoading = true;
    const safePage = this.isTeacherRole ? 0 : page;
    const request$ = this.registrationService.getRegistrationsByPageable(safePage);

    request$.subscribe({
      next: (data) => {
        const items = this.extractRegistrationItems(data);
        this.registrations = items.map((item) => this.normalizeRegistration(item));
        this.pagination = this.isTeacherRole ? null : data;

        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading registrations:', error);
        Swal.fire('Error', 'No se pudieron cargar las matrículas', 'error');
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.registrations;

    if (this.isTeacherRole) {
      if (this.allowedDegreeIds.length === 0) {
        this.filteredRegistrations = [];
        return;
      }

      filtered = filtered.filter(reg => this.allowedDegreeIds.includes(String(reg.degreeId || '').trim()));
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(reg => {
        const studentName = this.normalizeText(reg.studentFullName);
        const parentName = this.normalizeText(reg.parentFullName);
        const degree = this.normalizeText(reg.degreeCourse);
        const section = this.normalizeText(reg.degreeSection);
        const studentCode = this.normalizeText(reg.studentCode);
        const studentDni = this.normalizeText(reg.studentDni);
        const parentDni = this.normalizeText(reg.parentDni);
        const parentPhone = this.normalizeText(reg.parentPhone);
        const parentRelationship = this.normalizeText(reg.parentRelationship);
        return (
          studentName.includes(term) ||
          parentName.includes(term) ||
          degree.includes(term) ||
          section.includes(term) ||
          studentCode.includes(term)
          || studentDni.includes(term)
          || parentDni.includes(term)
          || parentPhone.includes(term)
          || parentRelationship.includes(term)
        );
      });
    }

    if (this.selectedDegreeCourse) {
      filtered = filtered.filter(
        (reg) => String(reg.degreeCourse || '').trim().toUpperCase() === this.selectedDegreeCourse
      );
    }

    if (this.selectedDegreeSection) {
      filtered = filtered.filter(
        (reg) => String(reg.degreeSection || '').trim().toUpperCase() === this.selectedDegreeSection
      );
    }

    if (this.filterStatus !== 'ALL') {
      const isActive = this.filterStatus === 'ACTIVE';
      filtered = filtered.filter(reg => reg.status === isActive);
    }

    this.filteredRegistrations = filtered;
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '').toLowerCase();
  }

  private extractRegistrationItems(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.content)) {
      return data.content;
    }

    return [];
  }

  private normalizeRegistration(registration: any): RegistrationDTO {
    const student = registration?.student || {};
    const studentUser = student?.user || {};
    const studentDegree = student?.degree || registration?.degree || {};
    const studentLevel = student?.educationLevel || registration?.educationLevel || {};
    const parent = registration?.parent || {};
    const parentUser = parent?.user || {};

    const studentFullName = String(
      registration?.studentFullName || `${studentUser?.name || ''} ${studentUser?.lastname || ''}`.trim()
    ).trim();
    const parentFullName = String(
      registration?.parentFullName || `${parentUser?.name || ''} ${parentUser?.lastname || ''}`.trim()
    ).trim();

    return {
      createdAt: registration?.createdAt ? new Date(registration.createdAt) : undefined,
      updatedAt: registration?.updatedAt ? new Date(registration.updatedAt) : undefined,
      degreeCourse: String(
        registration?.degreeCourse || studentDegree?.course || studentDegree?.name || ''
      ).trim(),
      degreeId: String(
        registration?.degreeId || studentDegree?.idDegree || studentDegree?.id || ''
      ).trim(),
      degreeSection: String(
        registration?.degreeSection || studentDegree?.section || ''
      ).trim(),
      educationLevelId: String(
        registration?.educationLevelId || studentLevel?.idEducationLevel || studentLevel?.id || ''
      ).trim(),
      educationLevelName: String(
        registration?.educationLevelName || studentLevel?.name || ''
      ).trim(),
      idRegistration: String(registration?.idRegistration || registration?.id || '').trim(),
      parentFullName,
      parentId: String(registration?.parentId || parent?.idParent || parent?.id || '').trim(),
      parentDni: String(registration?.parentDni || parentUser?.dni || '').trim(),
      parentPhone: String(registration?.parentPhone || parentUser?.phone || '').trim(),
      parentRelationship: String(registration?.parentRelationship || parent?.relationship || '').trim(),
      status: !!registration?.status,
      studentCode: String(registration?.studentCode || student?.code || '').trim(),
      studentFullName,
      studentId: String(registration?.studentId || student?.idStudent || student?.id || '').trim(),
      studentDni: String(registration?.studentDni || studentUser?.dni || '').trim()
    };
  }

  get filteredBaseRegistrations(): RegistrationDTO[] {
    if (!this.isTeacherRole) {
      return this.registrations;
    }

    if (this.allowedDegreeIds.length === 0) {
      return [];
    }

    return this.registrations.filter(reg => this.allowedDegreeIds.includes(String(reg.degreeId || '').trim()));
  }

  get availableDegreeCourses(): string[] {
    return Array.from(
      new Set(
        this.filteredBaseRegistrations
          .map((reg) => String(reg.degreeCourse || '').trim().toUpperCase())
          .filter((value) => !!value)
      )
    ).sort((a, b) => a.localeCompare(b, 'es'));
  }

  get availableDegreeSections(): string[] {
    const source = this.selectedDegreeCourse
      ? this.filteredBaseRegistrations.filter(
        (reg) => String(reg.degreeCourse || '').trim().toUpperCase() === this.selectedDegreeCourse
      )
      : this.filteredBaseRegistrations;

    return Array.from(
      new Set(
        source
          .map((reg) => String(reg.degreeSection || '').trim().toUpperCase())
          .filter((value) => !!value)
      )
    ).sort((a, b) => a.localeCompare(b, 'es'));
  }

  selectedDegreeCourse = '';
  selectedDegreeSection = '';

  onDegreeCourseChange(value: string): void {
    this.selectedDegreeCourse = String(value || '').trim().toUpperCase();

    if (this.selectedDegreeSection && !this.availableDegreeSections.includes(this.selectedDegreeSection)) {
      this.selectedDegreeSection = '';
    }

    this.applyFilters();
  }

  onDegreeSectionChange(value: string): void {
    this.selectedDegreeSection = String(value || '').trim().toUpperCase();
    this.applyFilters();
  }

  private resolveTeacherContext(): void {
    if (!this.isTeacherRole) {
      return;
    }

    const storedTeacherId = this.getTeacherIdFromStorage();
    const currentUser = this.authSession.currentUser;
    const userId = String(currentUser?.id || '').trim();
    const email = String(currentUser?.email || '').trim().toLowerCase();

    this.currentTeacherId = storedTeacherId || this.findTeacherIdByUserIdentity(userId, email);

    if (this.currentTeacherId) {
      this.persistTeacherId(this.currentTeacherId);
    }
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

        this.refreshAllowedDegrees();
      },
      error: () => {
        this.allTeachers = [];
        this.refreshAllowedDegrees();
      }
    });
  }

  private loadAssignments(): void {
    this.assignmentsService.getTeacherSubjectAssignments().subscribe({
      next: (response) => {
        this.assignments = response || [];
        this.refreshAllowedDegrees();
      },
      error: () => {
        this.assignments = [];
        this.refreshAllowedDegrees();
      }
    });
  }

  private refreshAllowedDegrees(): void {
    this.sessionTeacherMissing = false;

    if (!this.isTeacherRole) {
      this.allowedDegreeIds = [];
      return;
    }

    if (!this.currentTeacherId) {
      this.allowedDegreeIds = [];
      this.sessionTeacherMissing = true;
      return;
    }

    const teacherId = String(this.currentTeacherId || '').trim().toLowerCase();
    this.allowedDegreeIds = Array.from(
      new Set(
        this.assignments
          .filter((assignment) => String(assignment.teacherId || '').trim().toLowerCase() === teacherId)
          .map((assignment) => String(assignment.degreeId || '').trim())
          .filter((degreeId) => !!degreeId)
      )
    );

    this.applyFilters();
  }

  private findTeacherIdByUserIdentity(userId: string, email: string): string {
    const teacher = this.allTeachers.find((item) => {
      const teacherId = String(item.idTeacher || '').trim();
      const teacherUserId = String(item.user?.idUser || '').trim();
      const teacherEmail = String(item.user?.email || '').trim().toLowerCase();

      if (userId && teacherId === userId) {
        return true;
      }

      if (userId && teacherUserId === userId) {
        return true;
      }

      return !!email && teacherEmail === email;
    });

    return teacher?.idTeacher || '';
  }

  private getTeacherIdFromStorage(): string {
    const keys = ['currentTeacherId', 'teacherId', 'idTeacher'];

    for (const key of keys) {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) {
        return sessionValue;
      }

      const localValue = localStorage.getItem(key);
      if (localValue) {
        return localValue;
      }
    }

    return '';
  }

  private persistTeacherId(teacherId: string): void {
    const normalizedTeacherId = String(teacherId || '').trim();
    if (!normalizedTeacherId) {
      return;
    }

    sessionStorage.setItem('currentTeacherId', normalizedTeacherId);
  }

  toggleRegistrationStatus(registration: RegistrationDTO): void {
    if (this.isTeacherRole) {
      Swal.fire('Atencion', 'Los docentes solo pueden consultar la lista y el detalle de la matrícula.', 'info');
      return;
    }

    const nextStatus = !registration.status;
    const actionText = nextStatus ? 'activar' : 'inactivar';

    Swal.fire({
      title: `¿Deseas ${actionText} esta matrícula?`,
      text: nextStatus
        ? 'La matrícula volverá a estar disponible como activa.'
        : 'La matrícula quedará inactiva (baja lógica).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: nextStatus ? '#198754' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${actionText}`
    }).then((result) => {
      if (result.isConfirmed) {
        const body = {
          status: nextStatus,
          idStudent: registration.studentId,
          idParent: registration.parentId
        } as any;

        console.log('Updating registration with data:', body);

        this.registrationService.updateRegistration(registration.idRegistration, body).subscribe({
          next: () => {
            Swal.fire(
              'Actualizado',
              `La matrícula ahora está ${nextStatus ? 'activa' : 'inactiva'}.`,
              'success'
            );
            this.loadRegistrations(this.page as number);
          },
          error: (error) => {
            console.error('Error updating registration status:', error);
            Swal.fire('Error', 'No se pudo actualizar el estado de la matrícula', 'error');
          }
        });
      }
    });
  }

  getInitials(fullName: string): string {
    const normalized = String(fullName ?? '').trim();
    if (!normalized) {
      return 'NA';
    }

    const parts = normalized.split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return `${first}${last}`.toUpperCase();
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
  }

  getStatusText(status: string): string {
    return status === 'ACTIVE' ? 'Activo' : 'Inactivo';
  }
}
