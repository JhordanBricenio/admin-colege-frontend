import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserRole } from '../../models/auth';
import { AuthSessionService } from '../../services/auth-session.service';

interface SidebarSubMenuItem {
  label: string;
  route: string;
}

interface SidebarMenuItem {
  label: string;
  icon: string;
  allowedRoles: UserRole[];
  children: SidebarSubMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  private authSession = inject(AuthSessionService);
  private sessionSubscription?: Subscription;

  visibleMenuItems: SidebarMenuItem[] = [];

  private readonly menuItems: SidebarMenuItem[] = [
    {
      label: 'Roles',
      icon: 'home',
      allowedRoles: ['ADMIN'],
      children: [
        { label: 'Roles', route: '/admin/role' },
        { label: 'Nuevo Rol', route: '/admin/role/new' }
      ]
    },
    {
      label: 'Usuarios',
      icon: 'group',
      allowedRoles: ['ADMIN'],
      children: [
        { label: 'Usuarios', route: '/admin/user' },
        { label: 'Nuevo Usuario', route: '/admin/user/new' }
      ]
    },
    {
      label: 'Configuración',
      icon: 'settings',
      allowedRoles: ['ADMIN'],
      children: [
        { label: 'Configuración', route: '/admin/settings' },
        { label: 'Nueva Configuración', route: '/admin/settings/new' }
      ]
    },
    {
      label: 'Niveles',
      icon: 'school',
      allowedRoles: ['ADMIN'],
      children: [
        { label: 'Todos', route: '/admin/education-level' },
        { label: 'Nuevo Nivel', route: '/admin/education-level/new' }
      ]
    },
    {
      label: 'Grados',
      icon: 'grade',
      allowedRoles: ['ADMIN'],
      children: [
        { label: 'Todos', route: '/admin/degree' },
        { label: 'Nuevo Grado', route: '/admin/degree/new' }
      ]
    },
    {
      label: 'Cursos',
      icon: 'book',
      allowedRoles: ['ADMIN'],
      children: [
        { label: 'Todos', route: '/admin/subject' },
        { label: 'Nuevo Curso', route: '/admin/subject/new' }
      ]
    },
    {
      label: 'Docentes',
      icon: 'emoji_people',
      allowedRoles: ['ADMIN'],
      children: [
        { label: 'Docentes', route: '/admin/teacher' },
        { label: 'Asignar materias', route: '/admin/teacher/assign' }
      ]
    },
    {
      label: 'Calificaciones',
      icon: 'grade',
      allowedRoles: ['ADMIN', 'TEACHER'],
      children: [
        { label: 'Calificaciones', route: '/admin/student-grades' }
      ]
    },
    {
      label: 'Asistencia',
      icon: 'event_available',
      allowedRoles: ['ADMIN', 'TEACHER'],
      children: [
        { label: 'Docentes', route: '/admin/teacher-attendance' },
        { label: 'Alumnos', route: '/admin/student-attendance/new' }
      ]
    },
    {
      label: 'Estudiantes',
      icon: 'switch_account',
      allowedRoles: ['ADMIN'],
      children: [
        { label: 'Estudiantes', route: '/admin/student' },
        { label: 'Nuevo Estudiante', route: '/admin/student/new' }
      ]
    },
    {
      label: 'Padres',
      icon: 'switch_account',
      allowedRoles: ['ADMIN'],
      children: [
        { label: 'Padres', route: '/admin/parent' },
        { label: 'Nuevo Padre', route: '/admin/parent/new' }
      ]
    },
    {
      label: 'Matrícula',
      icon: 'app_registration',
      allowedRoles: ['ADMIN', 'STUDENT'],
      children: [
        { label: 'Matrículas', route: '/admin/registration' },
        { label: 'Registrar Matrícula', route: '/admin/registration/new' }
      ]
    },
    {
      label: 'Pagos',
      icon: 'payment',
      allowedRoles: ['ADMIN', 'STUDENT'],
      children: [
        { label: 'Pagos', route: '/admin/payment' },
        { label: 'Registrar Pago', route: '/admin/payment/new' }
      ]
    },
    {
      label: 'Kardex',
      icon: 'book',
      allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'],
      children: [
        { label: 'Kardex', route: '/admin/kardex' }
      ]
    }
  ];

  ngOnInit(): void {
    this.buildVisibleMenu();
    this.sessionSubscription = this.authSession.session$.subscribe(() => {
      this.buildVisibleMenu();
    });
  }

  ngOnDestroy(): void {
    this.sessionSubscription?.unsubscribe();
  }

  private buildVisibleMenu(): void {
    this.visibleMenuItems = this.menuItems.filter((menuItem) =>
      this.authSession.hasAnyRole(menuItem.allowedRoles)
    );
  }

}
