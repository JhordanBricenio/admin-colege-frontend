import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { StudentService } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { CourseService } from '../../services/course.service';
import { DegreeService } from '../../services/degree.service';
import { RegistrationService } from '../../services/registration.service';
import { ParentService } from '../../services/parent.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  private userService = inject(UserService);
  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);
  private parentService = inject(ParentService);
  private courseService = inject(CourseService);
  private degreeService = inject(DegreeService);
  private registrationService = inject(RegistrationService);

  totalUsers: number = 0;
  totalStudents: number = 0;
  totalTeachers: number = 0;
  totalCourses: number = 0;
  totalParents: number = 0;
  totalDegrees: number = 0;
  totalRegistrations: number = 0;

  get statCards() {
    return [
      {
        label: 'Estudiantes',
        value: this.totalStudents,
        icon: 'people',
        accent: 'accent-blue',
        note: 'Registro de alumnos activos',
        route: '/admin/student'
      },
      {
        label: 'Docentes',
        value: this.totalTeachers,
        icon: 'badge',
        accent: 'accent-indigo',
        note: 'Equipo docente disponible',
        route: '/admin/teacher'
      },
      {
        label: 'Matrículas',
        value: this.totalRegistrations,
        icon: 'fact_check',
        accent: 'accent-teal',
        note: 'Inscripciones procesadas',
        route: '/admin/registration'
      },
      {
        label: 'Cursos',
        value: this.totalCourses,
        icon: 'menu_book',
        accent: 'accent-gold',
        note: 'Oferta académica vigente',
        route: '/admin/subject'
      },
      {
        label: 'Grados',
        value: this.totalDegrees,
        icon: 'military_tech',
        accent: 'accent-coral',
        note: 'Niveles activos',
        route: '/admin/degree'
      },
      {
        label: 'Tutores',
        value: this.totalParents,
        icon: 'family_restroom',
        accent: 'accent-violet',
        note: 'Responsables registrados',
        route: '/admin/parent'
      },
      {
        label: 'Usuarios',
        value: this.totalUsers,
        icon: 'manage_accounts',
        accent: 'accent-emerald',
        note: 'Cuentas con acceso al sistema',
        route: '/admin/user'
      }
    ];
  }

  readonly quickActions = [
    {
      title: 'Nuevo estudiante',
      description: 'Registra un alumno y completa su ficha.',
      icon: 'person_add',
      route: '/admin/student/new'
    },
    {
      title: 'Nueva matrícula',
      description: 'Inicia un proceso de inscripción.',
      icon: 'post_add',
      route: '/admin/registration/new'
    },
    {
      title: 'Nuevo grado',
      description: 'Define un grado académico para el periodo.',
      icon: 'schema',
      route: '/admin/degree/new'
    },
    {
      title: 'Nuevo usuario',
      description: 'Crea accesos para administración o docencia.',
      icon: 'admin_panel_settings',
      route: '/admin/user/new'
    }
  ];

  ngOnInit(): void {
    this.loadAllData();
  }

  private loadAllData(): void {
    this.loadUsers();
    this.loadStudents();
    this.loadTeachers();
    this.loadParents();
    this.loadCourses();
    this.loadDegrees();
    this.loadRegistrations();
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.totalUsers = response.length;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.totalUsers = 0;
      }
    });
  }

  private loadStudents(): void {
    this.studentService.getUsers().subscribe({
      next: (response) => {
        this.totalStudents = response.length;
      },
      error: (error) => {
        console.error('Error fetching students:', error);
        this.totalStudents = 0;
      }
    });
  }

  private loadTeachers(): void {
    this.teacherService.getUsers().subscribe({
      next: (response) => {
        this.totalTeachers = response.length;
      },
      error: (error) => {
        console.error('Error fetching teachers:', error);
        this.totalTeachers = 0;
      }
    });
  }
  private loadParents(): void {
    this.parentService.getUsers().subscribe({
      next: (response) => {
        this.totalParents = response.length;
      },
      error: (error) => {
        console.error('Error fetching parents:', error);
        this.totalParents = 0;
      }
    });
  }

  private loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (response) => {
        this.totalCourses = response.length;
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
        this.totalCourses = 0;
      }
    });
  }

  private loadDegrees(): void {
    this.degreeService.getDegrees().subscribe({
      next: (response) => {
        this.totalDegrees = response.length;
      },
      error: (error) => {
        console.error('Error fetching degrees:', error);
        this.totalDegrees = 0;
      }
    });
  }

  private loadRegistrations(): void {
    this.registrationService.getRegistrations().subscribe({
      next: (response) => {
        this.totalRegistrations = response.length;
      },
      error: (error) => {
        console.error('Error fetching registrations:', error);
        this.totalRegistrations = 0;
      }
    });
  }

}
