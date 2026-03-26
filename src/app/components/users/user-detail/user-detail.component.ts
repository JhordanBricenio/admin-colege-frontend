import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TeacherService } from '../../../services/teacher.service';
import { StudentService } from '../../../services/student.service';
import { ParentService } from '../../../services/parent.service';
import { User } from '../../../models/user';
import { RoleService } from '../../../services/role.service';
import { Teacher } from '../../../models/teacher';
import { Student } from '../../../models/student';
import { Parent } from '../../../models/parent';

type DetailType = 'user' | 'teacher' | 'student' | 'parent';

type DetailField = {
  label: string;
  value: string;
  icon: string;
  tone: string;
};

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterModule, DatePipe],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent implements OnInit {
  private userService = inject(UserService);
  private teacherService = inject(TeacherService);
  private studentService = inject(StudentService);
  private parentService = inject(ParentService);
  private roleService = inject(RoleService);
  private route = inject(ActivatedRoute);

  detailType: DetailType = 'user';
  user: User | null = null;
  teacher: Teacher | null = null;
  student: Student | null = null;
  parent: Parent | null = null;
  roleName = '';
  isLoading = false;

  ngOnInit(): void {
    this.detailType = this.resolveDetailType();

    if (typeof window !== 'undefined' && sessionStorage) {
      const dni = sessionStorage.getItem('dni');
      if (dni) {
        this.loadDetail(dni);
      }
    }
  }

  get currentUser(): User | null {
    return this.teacher?.user ?? this.student?.user ?? this.parent?.user ?? this.user;
  }

  get pageTitle(): string {
    switch (this.detailType) {
      case 'teacher':
        return 'Detalle del docente';
      case 'student':
        return 'Detalle del estudiante';
      case 'parent':
        return 'Detalle del apoderado';
      default:
        return 'Detalle del usuario';
    }
  }

  get entityLabel(): string {
    switch (this.detailType) {
      case 'teacher':
        return 'Docente';
      case 'student':
        return 'Estudiante';
      case 'parent':
        return 'Apoderado';
      default:
        return 'Usuario';
    }
  }

  get backRoute(): string {
    switch (this.detailType) {
      case 'teacher':
        return '/admin/teacher';
      case 'student':
        return '/admin/student';
      case 'parent':
        return '/admin/parent';
      default:
        return '/admin/user';
    }
  }

  get fullName(): string {
    const currentUser = this.currentUser;
    return currentUser ? `${currentUser.name} ${currentUser.lastname}`.trim() : '';
  }

  get summaryFields(): DetailField[] {
    const currentUser = this.currentUser;
    if (!currentUser) {
      return [];
    }

    return [
      { label: 'DNI', value: currentUser.dni || 'No registrado', icon: 'fas fa-id-card', tone: 'info' },
      { label: 'Rol', value: this.roleName || 'No asignado', icon: 'fas fa-user-shield', tone: 'primary' },
      { label: 'Teléfono', value: currentUser.phone || 'No registrado', icon: 'fas fa-phone-alt', tone: 'success' },
      { label: 'Correo', value: currentUser.email || 'No registrado', icon: 'fas fa-envelope', tone: 'warning' }
    ];
  }

  get personalFields(): DetailField[] {
    const currentUser = this.currentUser;
    if (!currentUser) {
      return [];
    }

    return [
      { label: 'Fecha de nacimiento', value: currentUser.birthDate || 'No registrada', icon: 'fas fa-calendar-alt', tone: 'primary' },
      { label: 'Género', value: currentUser.gender || 'No registrado', icon: 'fas fa-user', tone: 'secondary' },
      { label: 'Dirección', value: currentUser.address || 'No registrada', icon: 'fas fa-map-marker-alt', tone: 'danger' }
    ];
  }

  get specificFields(): DetailField[] {
    if (this.detailType === 'teacher' && this.teacher) {
      return [
        { label: 'Especialidad', value: this.teacher.specialty || 'No registrada', icon: 'fas fa-book-reader', tone: 'primary' }
      ];
    }

    if (this.detailType === 'student' && this.student) {
      return [
        { label: 'Código', value: this.student.code || 'Autogenerado', icon: 'fas fa-hashtag', tone: 'info' },
        { label: 'Nivel educativo', value: this.student.educationLevel?.name || 'No asignado', icon: 'fas fa-layer-group', tone: 'success' },
        { label: 'Grado', value: this.student.degree ? `${this.student.degree.course} - Sección ${this.student.degree.section}` : 'No asignado', icon: 'fas fa-graduation-cap', tone: 'warning' },
        { label: 'Estado', value: this.student.status ? 'Activo' : 'Inactivo', icon: 'fas fa-toggle-on', tone: this.student.status ? 'success' : 'danger' }
      ];
    }

    if (this.detailType === 'parent' && this.parent) {
      return [
        { label: 'Parentesco', value: this.parent.relationship || 'No registrado', icon: 'fas fa-people-arrows', tone: 'primary' },
        { label: 'Ocupación', value: this.parent.occupation || 'No registrada', icon: 'fas fa-briefcase', tone: 'success' },
        { label: 'Estudiante asignado', value: this.parent.student?.user ? `${this.parent.student.user.name} ${this.parent.student.user.lastname}` : 'No asignado', icon: 'fas fa-user-graduate', tone: 'warning' },
        { label: 'Grado del estudiante', value: this.parent.student?.degree ? `${this.parent.student.degree.course} - Sección ${this.parent.student.degree.section}` : 'No asignado', icon: 'fas fa-school', tone: 'info' }
      ];
    }

    return [];
  }

  private resolveDetailType(): DetailType {
    const path = this.route.snapshot.routeConfig?.path ?? '';

    if (path.startsWith('teacher/')) {
      return 'teacher';
    }

    if (path.startsWith('student/')) {
      return 'student';
    }

    if (path.startsWith('parent/')) {
      return 'parent';
    }

    return 'user';
  }

  private loadDetail(dni: string): void {
    this.isLoading = true;

    switch (this.detailType) {
      case 'teacher':
        this.teacherService.getUserByDni(dni).subscribe({
          next: (response) => {
            this.teacher = response;
            this.loadRole(response.user.rolId);
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
        break;
      case 'student':
        this.studentService.getUserByDni(dni).subscribe({
          next: (response) => {
            this.student = response;
            this.loadRole(response.user.rolId);
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
        break;
      case 'parent':
        this.parentService.getUserByDni(dni).subscribe({
          next: (response) => {
            this.parent = response;
            this.loadRole(response.user.rolId);
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
        break;
      default:
        this.userService.getUserByDni(dni).subscribe({
          next: (response) => {
            this.user = response;
            this.loadRole(response.rolId);
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
        break;
    }
  }

  private loadRole(roleId: string): void {
    this.roleService.getRoleById(roleId).subscribe(
      response => {
        this.roleName = response.name;
      }
    );
  }
}
