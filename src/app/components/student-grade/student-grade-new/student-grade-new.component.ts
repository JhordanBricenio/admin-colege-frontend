import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Student } from '../../../models/student';
import { StudentGrade } from '../../../models/student-grade';
import { StudentService } from '../../../services/student.service';
import { StudentGradeService } from '../../../services/student-grade.service';
import { TeacherService } from '../../../services/teacher.service';
import { DegreeService } from '../../../services/degree.service';
import { EducationLevelService } from '../../../services/education-level.service';
import { CourseService } from '../../../services/course.service';
import { Degree } from '../../../models/degree';
import { EducationLevel } from '../../../models/education-level';
import { Course } from '../../../models/course';

@Component({
  selector: 'app-student-grade-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-grade-new.component.html',
  styleUrl: './student-grade-new.component.css'
})
export class StudentGradeNewComponent {

  private readonly fb = inject(FormBuilder);
  private readonly studentGradeService = inject(StudentGradeService);
  private readonly studentService = inject(StudentService);
  private readonly teacherService = inject(TeacherService);
  private readonly degreeService = inject(DegreeService);
  private readonly educationLevelService = inject(EducationLevelService);
  private readonly courseService = inject(CourseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  assignmentId = '';
  teacherId = '';
  degreeId = '';
  educationLevelId = '';
  courseId = '';
  selectedCourseId = '';

  readonly terms = [
    { value: 'BIMESTER_1', label: 'Bimestre 1' },
    { value: 'BIMESTER_2', label: 'Bimestre 2' },
    { value: 'BIMESTER_3', label: 'Bimestre 3' },
    { value: 'BIMESTER_4', label: 'Bimestre 4' }
  ];
  readonly promotionMinGrade = 11;

  teacherName = '';
  students: any[] = [];
  studentOptions: Student[] = [];
  studentGrades: StudentGrade[] = [];
  gradeMap: Record<string, Record<string, StudentGrade | null>> = {};
  draftGrades: Record<string, Record<string, string>> = {};
  savingCellKey = '';
  deletingCellKey = '';
  degrees: Degree[] = [];
  educationLevels: EducationLevel[] = [];
  courses: Course[] = [];
  loading = false;

  gradeForm = this.fb.nonNullable.group({
    idStudent: ['', Validators.required],
    term: ['', Validators.required],
    grade: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    status: [true, Validators.required]
  });

  ngOnInit(): void {
    this.resolveContext();
    this.loadTeacherName();
    this.loadCatalogs();
    this.loadStudents();
    this.loadStudentGrades();
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const newCourseId = this.route.snapshot.queryParamMap.get('courseId') || '';
        if (newCourseId !== this.courseId) {
          console.log(`Curso cambió de ${this.courseId} a ${newCourseId}`);
          this.courseId = newCourseId;
          this.selectedCourseId = newCourseId || this.selectedCourseId;
          this.loadStudentGrades();
        }
      });
  }

  get effectiveCourseId(): string {
    return this.courseId || this.selectedCourseId;
  }

  get needsManualCourseSelection(): boolean {
    return !this.courseId;
  }

  get filteredCoursesByEducationLevel(): Course[] {
    if (!this.educationLevelId) {
      return this.courses;
    }

    return this.courses.filter(
      (course) => String(course.educationLevelId || '') === String(this.educationLevelId)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.gradeForm.invalid || !this.teacherId) {
      this.gradeForm.markAllAsTouched();
      if (!this.teacherId) {
        Swal.fire('Atencion', 'No se encontro el docente para registrar la nota', 'warning');
      }
      return;
    }

    if (!this.effectiveCourseId) {
      Swal.fire('Atencion', 'Selecciona un curso para registrar las notas', 'warning');
      return;
    }

    if (!this.isCourseInCurrentEducationLevel(this.effectiveCourseId)) {
      Swal.fire('Atencion', 'El curso seleccionado no pertenece al nivel educativo de la asignación', 'warning');
      return;
    }

    const formValue = this.gradeForm.getRawValue();
    const payload: StudentGrade = {
      studentId: formValue.idStudent,
      teacherId: this.teacherId,
      term: formValue.term,
      grade: formValue.grade,
      status: formValue.status,
      courseId: this.effectiveCourseId
    };

    console.log('Payload for new grade:', payload);
    this.loading = true;
    this.studentGradeService.saveStudentGrades(payload).subscribe({
      next: () => {
        this.loading = false;
        this.gradeForm.patchValue({ term: '', grade: '' });
        this.loadStudentGrades();
        Swal.fire('Exito', 'Nota registrada correctamente', 'success');
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudo registrar la nota', 'error');
      }
    });
  }

  getGradeCell(studentId: string, term: string): StudentGrade | null {
    return this.gradeMap[studentId]?.[term] || null;
  }

  getCellValue(studentId: string, term: string): string {
    return this.draftGrades[studentId]?.[term] || '';
  }

  onCellInput(studentId: string, term: string, value: string): void {
    if (!this.draftGrades[studentId]) {
      this.draftGrades[studentId] = {};
    }
    this.draftGrades[studentId][term] = value;
  }

  saveCellGrade(student: Student, term: string): void {
    const studentId = student.idStudent;
    const value = (this.getCellValue(studentId, term) || '').trim();
    const existing = this.getGradeCell(studentId, term);

    if (!value) {
      Swal.fire('Atencion', 'Ingresa una nota para guardar', 'warning');
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      Swal.fire('Atencion', 'Formato de nota invalido', 'warning');
      return;
    }

    const payload: StudentGrade = {
      idStudentGrade: existing?.idStudentGrade,
      studentId,
      teacherId: this.teacherId,
      term,
      grade: value,
      status: existing?.status ?? true,
      courseId: this.effectiveCourseId,
    };

    console.log('Payload for cell save:', payload);

    const key = `${studentId}_${term}`;
    this.savingCellKey = key;

    const request$ = existing?.idStudentGrade
      ? this.studentGradeService.updateStudentGrades(payload)
      : this.studentGradeService.saveStudentGrades(payload);

    request$.subscribe({
      next: () => {
        this.savingCellKey = '';
        this.loadStudentGrades();
        Swal.fire('Exito', 'Nota actualizada', 'success');
      },
      error: () => {
        this.savingCellKey = '';
        Swal.fire('Error', 'No se pudo guardar la nota', 'error');
      }
    });
  }

  deleteCellGrade(studentId: string, term: string): void {
    const existing = this.getGradeCell(studentId, term);
    if (!existing?.idStudentGrade) {
      return;
    }

    Swal.fire({
      title: 'Eliminar nota',
      text: 'Esta accion no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const key = `${studentId}_${term}`;
      this.deletingCellKey = key;

      this.studentGradeService.deleteStudentGrade(existing.idStudentGrade).subscribe({
        next: () => {
          this.deletingCellKey = '';
          this.loadStudentGrades();
          Swal.fire('Eliminado', 'Nota eliminada correctamente', 'success');
        },
        error: () => {
          this.deletingCellKey = '';
          Swal.fire('Error', 'No se pudo eliminar la nota', 'error');
        }
      });
    });
  }

  getAnnualAverage(studentId: string): number | null {
    const values = this.terms
      .map((term) => Number((this.getCellValue(studentId, term.value) || '').replace(',', '.')))
      .filter((value) => Number.isFinite(value));

    if (values.length === 0) {
      return null;
    }

    const sum = values.reduce((acc, value) => acc + value, 0);
    return Number((sum / values.length).toFixed(2));
  }

  hasCompleteYear(studentId: string): boolean {
    return this.terms.every((term) => {
      const value = (this.getCellValue(studentId, term.value) || '').trim();
      return value !== '';
    });
  }

  isPromoted(studentId: string): boolean {
    const average = this.getAnnualAverage(studentId);
    if (average === null || !this.hasCompleteYear(studentId)) {
      return false;
    }
    return average >= this.promotionMinGrade;
  }

  goBack(): void {
    this.router.navigate(['/admin/student-grades'], {
      queryParams: {
        teacherId: this.teacherId
      }
    });
  }

  get contextEducationLevelName(): string {
    if (!this.educationLevelId) {
      return '';
    }
    const level = this.educationLevels.find((item) => String(item.idEducationLevel) === String(this.educationLevelId));
    return level ? `${level.name} - ${level.shift}` : '';
  }

  get contextDegreeName(): string {
    if (!this.degreeId) {
      return '';
    }
    const degree = this.degrees.find((item) => String(item.idDegree) === String(this.degreeId));
    return degree ? `${degree.course} ${degree.section}` : '';
  }

  get contextCourseName(): string {
    const courseId = this.effectiveCourseId;
    if (!courseId) {
      return '';
    }
    const course = this.courses.find((item) => String(item.idCourse) === String(courseId));
    return course?.name || '';
  }

  private resolveContext(): void {
    this.assignmentId = this.route.snapshot.queryParamMap.get('assignmentId') || '';
    this.teacherId = this.route.snapshot.queryParamMap.get('teacherId') || this.getTeacherIdFromStorage();
    this.educationLevelId = this.route.snapshot.queryParamMap.get('educationLevelId') || '';
    this.degreeId = this.route.snapshot.queryParamMap.get('degreeId') || '';
    this.courseId = this.route.snapshot.queryParamMap.get('courseId') || '';
    this.selectedCourseId = this.courseId;

    if (this.teacherId) {
      sessionStorage.setItem('currentTeacherId', this.teacherId);
    }

    this.updateStudentOptions();
  }

  private getTeacherIdFromStorage(): string {
    const keys = ['teacherId', 'idTeacher', 'currentTeacherId'];
    const value = keys
      .map((key) => sessionStorage.getItem(key) || localStorage.getItem(key) || '')
      .find((item) => !!item);

    return value || '';
  }

  private loadTeacherName(): void {
    if (!this.teacherId) {
      this.teacherName = 'Docente no definido';
      return;
    }

    this.teacherService.getUsers().subscribe({
      next: (response) => {
        const teacher = (response || []).find((item) => item.idTeacher === this.teacherId);
        if (!teacher) {
          this.teacherName = this.teacherId;
          return;
        }
        const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim();
        const dni = teacher.user?.dni || 'Sin DNI';
        this.teacherName = `${fullName} - DNI: ${dni}`;
      },
      error: () => {
        this.teacherName = this.teacherId;
      }
    });
  }

  private loadStudents(): void {
    this.studentService.getUsers().subscribe({
      next: (response) => {
        this.students = response || [];
        this.updateStudentOptions();
        this.buildGradeMatrix();
      },
      error: () => {
        this.students = [];
        this.studentOptions = [];
        this.buildGradeMatrix();
      }
    });
  }

  private loadStudentGrades(): void {
    this.studentGradeService.getStudentGrades().subscribe({
      next: (response) => {
        const courseId = this.effectiveCourseId;
        this.studentGrades = (response || []).filter((item) => {
          const sameTeacher = !this.teacherId || String(item.teacherId || '') === String(this.teacherId);
          const sameCourse = !courseId || String(item.courseId || '') === String(courseId);
          return sameTeacher && sameCourse;
        });
        console.log(`Notas cargadas para curso ${courseId}:`, this.studentGrades.length);
        this.buildGradeMatrix();
      },
      error: () => {
        this.studentGrades = [];
        this.buildGradeMatrix();
      }
    });
  }

  private updateStudentOptions(): void {
    if (!this.degreeId || !this.educationLevelId) {
      this.studentOptions = [];
      this.buildGradeMatrix();
      return;
    }

    this.studentOptions = this.students.filter((item) => {
      const studentDegreeId = String(item.idDegree || '');
      const studentLevelId = String(item.idEducationLevel || '');
      const matchesDegree = studentDegreeId === String(this.degreeId);
      const matchesLevel = studentLevelId === String(this.educationLevelId);
      const isActive = item.status !== false;
      return matchesDegree && matchesLevel && isActive;
    }).sort((a, b) => {
      const aLast = this.getPaternalLastName(a).toLowerCase();
      const bLast = this.getPaternalLastName(b).toLowerCase();

      const lastNameCompare = aLast.localeCompare(bLast, 'es');
      if (lastNameCompare !== 0) {
        return lastNameCompare;
      }

      const aName = `${a.user?.name || ''} ${a.user?.lastname || ''}`.trim().toLowerCase();
      const bName = `${b.user?.name || ''} ${b.user?.lastname || ''}`.trim().toLowerCase();
      return aName.localeCompare(bName, 'es');
    });

    this.buildGradeMatrix();
  }

  private getPaternalLastName(student: Student): string {
    const fullLastName = (student.user?.lastname || '').trim();
    if (!fullLastName) {
      return '';
    }

    const parts = fullLastName.split(/\s+/).filter(Boolean);
    return parts[0] || fullLastName;
  }

  getStudentDisplayName(student: Student): string {
    const lastNames = (student.user?.lastname || '').trim();
    const names = (student.user?.name || '').trim();
    const full = `${lastNames}, ${names}`.trim().replace(/^,\s*/, '');
    return full || 'Sin nombre';
  }

  private buildGradeMatrix(): void {
    // Limpiar completamente para evitar reutilizar datos de otro curso
    this.gradeMap = {};
    this.draftGrades = {};

    // Inicializar estructura vacía para cada alumno del grupo actual
    for (const student of this.studentOptions) {
      const row: Record<string, StudentGrade | null> = {};
      const rowDraft: Record<string, string> = {};

      // Inicializar todos los bimestres como null/vacío
      for (const term of this.terms) {
        row[term.value] = null;
        rowDraft[term.value] = '';
      }

      this.gradeMap[student.idStudent] = row;
      this.draftGrades[student.idStudent] = rowDraft;
    }

    // Llenar con las notas del curso actual (ya filtradas en loadStudentGrades)
    for (const grade of this.studentGrades) {
      const studentId = String(grade.studentId || '');
      const term = grade.term;

      if (this.gradeMap[studentId] && this.gradeMap[studentId][term] !== undefined) {
        this.gradeMap[studentId][term] = grade;
        this.draftGrades[studentId][term] = (grade.grade || '').toString();
      }
    }
  }

  private loadCatalogs(): void {
    this.degreeService.getDegrees().subscribe({
      next: (response) => {
        this.degrees = response || [];
      },
      error: () => {
        this.degrees = [];
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

    this.courseService.getCourses().subscribe({
      next: (response) => {
        this.courses = response || [];

        // Si no llega courseId por contexto, seleccionar automáticamente
        // solo cuando exista un único curso del nivel educativo actual.
        const filteredCourses = this.filteredCoursesByEducationLevel;
        if (!this.courseId && !this.selectedCourseId && filteredCourses.length === 1) {
          this.selectedCourseId = String(filteredCourses[0].idCourse || '');
          this.loadStudentGrades();
        }
      },
      error: () => {
        this.courses = [];
      }
    });
  }

  onCourseChange(courseId: string): void {
    this.selectedCourseId = courseId;
    this.loadStudentGrades();
  }

  private isCourseInCurrentEducationLevel(courseId: string): boolean {
    if (!courseId || !this.educationLevelId) {
      return true;
    }

    return this.filteredCoursesByEducationLevel.some(
      (course) => String(course.idCourse || '') === String(courseId)
    );
  }

}
