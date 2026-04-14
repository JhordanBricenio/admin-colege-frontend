import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from '../../../models/course';
import { Degree } from '../../../models/degree';
import { EducationLevel } from '../../../models/education-level';
import { Teacher } from '../../../models/teacher';
import { TeacherSubjectAssignments } from '../../../models/teacherSubjectAssignments';
import { CourseService } from '../../../services/course.service';
import { DegreeService } from '../../../services/degree.service';
import { EducationLevelService } from '../../../services/education-level.service';
import { TeacherService } from '../../../services/teacher.service';
import { TeacherSubjectAssignmentsService } from '../../../services/teacherSubjectAssignments.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-student-grade-index',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-grade-index.component.html',
  styleUrl: './student-grade-index.component.css'
})
export class StudentGradeIndexComponent {

  private readonly assignmentsService = inject(TeacherSubjectAssignmentsService);
  private readonly teacherService = inject(TeacherService);
  private readonly educationLevelService = inject(EducationLevelService);
  private readonly degreeService = inject(DegreeService);
  private readonly courseService = inject(CourseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  assignments: TeacherSubjectAssignments[] = [];
  allTeachers: Teacher[] = [];
  educationLevels: EducationLevel[] = [];
  degrees: Degree[] = [];
  courses: Course[] = [];

  currentTeacherId = '';
  loading = true;

  ngOnInit(): void {
    this.resolveTeacherContext();
    this.loadData();
  }

  get teacherAssignments(): TeacherSubjectAssignments[] {
    if (!this.currentTeacherId) {
      return [];
    }
    return this.assignments.filter((item) => item.teacherId === this.currentTeacherId);
  }

  get currentTeacher(): Teacher | null {
    return this.allTeachers.find((item) => item.idTeacher === this.currentTeacherId) || null;
  }

  onTeacherChange(teacherId: string): void {
    this.currentTeacherId = teacherId;
    this.persistTeacherId(teacherId);
  }

  goToRegisterGrades(assignment: TeacherSubjectAssignments): void {
    if (!this.canRegisterGrades(assignment)) {
      Swal.fire(
        'Atencion',
        'Para asignaciones de Secundaria es obligatorio tener curso asociado antes de registrar notas.',
        'warning'
      );
      return;
    }

    this.router.navigate(['/admin/student-grades/new'], {
      queryParams: {
        assignmentId: assignment.idTeacherSubjectAssignments,
        teacherId: assignment.teacherId,
        educationLevelId: assignment.educationLevelId,
        degreeId: assignment.degreeId,
        courseId: assignment.courseId
      }
    });
  }

  canRegisterGrades(assignment: TeacherSubjectAssignments): boolean {
    if (!assignment) {
      return false;
    }

    if (!this.isSecondaryAssignment(assignment)) {
      return true;
    }

    return !!String(assignment.courseId || '').trim();
  }

  isSecondaryAssignment(assignment: TeacherSubjectAssignments): boolean {
    const levelId = String(assignment.educationLevelId || '');
    if (!levelId) {
      return false;
    }

    const level = this.educationLevels.find(
      (item) => String(item.idEducationLevel || '') === levelId
    );

    const normalizedType = String(level?.levelType || '').toUpperCase();
    if (normalizedType === 'SECONDARY') {
      return true;
    }

    const normalizedName = String(level?.name || '').toUpperCase();
    return normalizedName.includes('SECUNDARIA') || normalizedName.includes('SECONDARY');
  }

  getTeacherDisplayName(teacher: Teacher): string {
    const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim();
    const dni = teacher.user?.dni || 'Sin DNI';
    return `${fullName} - DNI: ${dni}`;
  }

  getEducationLevelNameById(idEducationLevel: string): string {
    const level = this.educationLevels.find((item) => item.idEducationLevel === idEducationLevel);
    return level ? `${level.name} - ${level.shift}` : idEducationLevel;
  }

  getDegreeNameById(idDegree: string): string {
    const degree = this.degrees.find((item) => item.idDegree === idDegree);
    return degree ? `${degree.course} - Seccion ${degree.section}` : idDegree;
  }

  getCourseNameById(idCourse: string): string {
    const course = this.courses.find((item) => item.idCourse === idCourse);
    return course ? course.name : idCourse;
  }

  private loadData(): void {
    this.loading = true;

    this.teacherService.getUsers().subscribe({
      next: (response) => {
        this.allTeachers = response || [];
      },
      error: () => {
        this.allTeachers = [];
      }
    });

    this.assignmentsService.getTeacherSubjectAssignments().subscribe({
      next: (response) => {
        this.assignments = response || [];
        this.ensureTeacherFallback();
        this.loading = false;
      },
      error: () => {
        this.assignments = [];
        this.loading = false;
      }
    });

    this.educationLevelService.getEducationLevels().subscribe({
      next: (response) => {
        this.educationLevels = response || [];
      },
      error: () => {
        this.educationLevels = [];
      }
    });

    this.degreeService.getDegrees().subscribe({
      next: (response) => {
        this.degrees = response || [];
      },
      error: () => {
        this.degrees = [];
      }
    });

    this.courseService.getCourses().subscribe({
      next: (response) => {
        this.courses = response || [];
      },
      error: () => {
        this.courses = [];
      }
    });
  }

  private resolveTeacherContext(): void {
    const queryTeacherId = this.route.snapshot.queryParamMap.get('teacherId');
    const storageTeacherId = this.getTeacherIdFromStorage();

    this.currentTeacherId = queryTeacherId || storageTeacherId || '';

    if (queryTeacherId) {
      this.persistTeacherId(queryTeacherId);
    }
  }

  private ensureTeacherFallback(): void {
    if (this.currentTeacherId) {
      return;
    }

    const firstAssignedTeacherId = this.assignments.find((item) => !!item.teacherId)?.teacherId || '';
    if (!firstAssignedTeacherId) {
      return;
    }

    this.currentTeacherId = firstAssignedTeacherId;
    this.persistTeacherId(firstAssignedTeacherId);
  }

  private getTeacherIdFromStorage(): string {
    const keys = ['teacherId', 'idTeacher', 'currentTeacherId'];
    const value = keys
      .map((key) => sessionStorage.getItem(key) || localStorage.getItem(key) || '')
      .find((item) => !!item);

    return value || '';
  }

  private persistTeacherId(teacherId: string): void {
    if (!teacherId) {
      return;
    }

    sessionStorage.setItem('currentTeacherId', teacherId);
  }

}
