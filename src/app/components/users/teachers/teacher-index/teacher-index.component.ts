import { Component, inject } from '@angular/core';
import { Teacher } from '../../../../models/teacher';
import { TeacherService } from '../../../../services/teacher.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { NgFor, NgIf } from '@angular/common';
import { PaginatorComponent } from '../../../paginator/paginator.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeacherSubjectAssignmentsService } from '../../../../services/teacherSubjectAssignments.service';
import { TeacherSubjectAssignments } from '../../../../models/teacherSubjectAssignments';
import { EducationLevelService } from '../../../../services/education-level.service';
import { DegreeService } from '../../../../services/degree.service';
import { CourseService } from '../../../../services/course.service';
import { EducationLevel } from '../../../../models/education-level';
import { Degree } from '../../../../models/degree';
import { Course } from '../../../../models/course';

@Component({
  selector: 'app-teacher-index',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, PaginatorComponent, ReactiveFormsModule],
  templateUrl: './teacher-index.component.html',
  styleUrl: './teacher-index.component.css'
})
export class TeacherIndexComponent {

  public users: Teacher[] = [];
  public allTeachers: Teacher[] = [];
  public assignments: TeacherSubjectAssignments[] = [];
  public educationLevels: EducationLevel[] = [];
  public degrees: Degree[] = [];
  public courses: Course[] = [];

  isAssignModalOpen = false;
  isAssignmentsModalOpen = false;
  selectedTeacherForAssignments: Teacher | null = null;
  editingAssignmentId: number | null = null;
  teacherSearchText = '';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private teacherService = inject(TeacherService);
  private readonly fb = inject(FormBuilder);
  private readonly assignmentsService = inject(TeacherSubjectAssignmentsService);
  private readonly educationLevelService = inject(EducationLevelService);
  private readonly degreeService = inject(DegreeService);
  private readonly courseService = inject(CourseService);
  page: number | null = 0;
  pagination: any;

  assignmentForm = this.fb.nonNullable.group({
    teacherId: ['', Validators.required],
    educationLevelId: [''],
    degreeId: [''],
    courseId: [''],
    status: [true, Validators.required]
  });


  constructor() { }


  ngOnInit(): void {
    this.loadAllTeachers();
    this.loadAssignments();
    this.loadCatalogs();

    this.route.paramMap.subscribe(params => {
      const pageParam = params.get('page');
      this.page = pageParam !== null ? +pageParam : 0;
      if (isNaN(this.page as number)) {
        this.page = 0;
      }
      this.loadUsers(this.page as number);
    });
  }

  private loadUsers(page: number) {
    this.teacherService.getUsersByPageable(page).subscribe({
      next: (response) => {
        this.users = response.content as Teacher[];
        this.pagination = response;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  private loadAllTeachers(): void {
    this.teacherService.getUsers().subscribe({
      next: (response) => {
        this.allTeachers = response || [];
      },
      error: () => {
        this.allTeachers = [];
      }
    });
  }

  private loadAssignments(): void {
    this.assignmentsService.getTeacherSubjectAssignments().subscribe({
      next: (response) => {
        this.assignments = response || [];
      },
      error: () => {
        this.assignments = [];
      }
    });
  }

  private loadCatalogs(): void {
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


  getUserByDni(dni: string) {
    if (dni.length === 8) {
      this.teacherService.getUserByDni(dni).subscribe(
        response => {
          this.users = [];
          this.users.push(response);
          this.pagination = null;
        }
      );
    } else {
      this.loadUsers(this.page ?? 0);
    }
  }

  verUser(dni: string) {
    sessionStorage.setItem('dni', dni);
    this.router.navigate(['/admin/teacher/detail']);
  }

  deleteUser(id: string): void {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.teacherService.deleteUser(id).subscribe(
          {
            next: () => {
              this.users = this.users.filter(user => user.idTeacher !== id);
              Swal.fire({
                title: "¡Eliminado!",
                text: "El usuario ha sido eliminado con éxito.",
                icon: "success"
              });
              this.loadUsers(this.page as number);
            },
            error: (error) => {
              console.log(error);
              Swal.fire({
                title: "Error",
                text: "Hubo un problema al eliminar el profesor.",
                icon: "error"
              });
            }
          });
      }
    });
  }

  openAssignModal(teacher?: Teacher, assignment?: TeacherSubjectAssignments): void {
    this.isAssignModalOpen = true;

    this.editingAssignmentId = assignment?.idTeacherSubjectAssignments ?? null;

    const resolvedEducationLevelId = assignment?.educationLevelId || this.resolveEducationLevelFromAssignment(assignment);

    this.assignmentForm.reset({
      teacherId: assignment?.teacherId || teacher?.idTeacher || '',
      educationLevelId: resolvedEducationLevelId || '',
      degreeId: assignment?.degreeId || '',
      courseId: assignment?.courseId || '',
      status: assignment?.status ?? true
    });

    if (assignment?.teacherId) {
      const selectedTeacher = this.allTeachers.find((item) => item.idTeacher === assignment.teacherId);
      this.teacherSearchText = selectedTeacher ? this.getTeacherDisplayName(selectedTeacher) : '';
    } else if (teacher) {
      this.teacherSearchText = this.getTeacherDisplayName(teacher);
    } else {
      this.teacherSearchText = '';
    }
  }

  closeAssignModal(): void {
    this.isAssignModalOpen = false;
    this.editingAssignmentId = null;
    this.teacherSearchText = '';
  }

  openAssignmentsModal(teacher: Teacher): void {
    this.selectedTeacherForAssignments = teacher;
    this.isAssignmentsModalOpen = true;
  }

  closeAssignmentsModal(): void {
    this.isAssignmentsModalOpen = false;
    this.selectedTeacherForAssignments = null;
  }

  saveAssignment(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.assignmentForm.getRawValue();
    const hasDegree = !!(formValue.degreeId || '').trim();
    const hasCourse = !!(formValue.courseId || '').trim();
    const isPrimaryOrInitial = this.isPrimaryOrInitialByLevelId(formValue.educationLevelId || '');

    // Validación por tipo de nivel educativo
    if (isPrimaryOrInitial) {
      // Para Inicial/Primaria: degree_id obligatorio, course_id debe ser nulo
      if (!hasDegree) {
        Swal.fire('Atencion', 'Para niveles Inicial/Primaria se requiere seleccionar un grado.', 'warning');
        return;
      }
      if (hasCourse) {
        Swal.fire('Atencion', 'Para niveles Inicial/Primaria no se asigna por curso. Dejar curso vacío.', 'warning');
        return;
      }
    } else {
      // Para Secundaria: degree_id y course_id obligatorios
      if (!hasDegree || !hasCourse) {
        Swal.fire('Atencion', 'Para Secundaria se requiere seleccionar tanto el grado como el curso.', 'warning');
        return;
      }
    }

    const payload: Record<string, any> = {
      teacherId: formValue.teacherId,
      status: formValue.status
    };

    if (isPrimaryOrInitial) {
      // Inicial/Primaria: enviar solo degreeId
      payload['degreeId'] = formValue.degreeId;
    } else {
      // Secundaria: enviar ambos degreeId y courseId
      payload['degreeId'] = formValue.degreeId;
      payload['courseId'] = formValue.courseId;
    }

    console.log('Teacher assignment payload:', payload);

    const request$ = this.editingAssignmentId
      ? this.assignmentsService.updateTeacherSubjectAssignments({
        ...payload,
        idTeacherSubjectAssignments: this.editingAssignmentId
      } as TeacherSubjectAssignments)
      : this.assignmentsService.saveTeacherSubjectAssignments(payload as TeacherSubjectAssignments);

    request$.subscribe({
      next: () => {
        Swal.fire(
          'Exito',
          this.editingAssignmentId
            ? 'Asignacion actualizada correctamente'
            : 'Asignacion registrada correctamente',
          'success'
        );
        this.closeAssignModal();
        this.loadAssignments();
      },
      error: (errorResponse) => {
        const backendMessage =
          errorResponse?.error?.message ||
          errorResponse?.error?.error ||
          errorResponse?.message ||
          '';

        Swal.fire(
          'Error',
          backendMessage || (this.editingAssignmentId
            ? 'No se pudo actualizar la asignacion'
            : 'No se pudo registrar la asignacion'),
          'error'
        );
      }
    });
  }

  editAssignment(assignment: TeacherSubjectAssignments): void {
    const teacher = this.allTeachers.find((item) => item.idTeacher === assignment.teacherId);
    this.closeAssignmentsModal();
    this.openAssignModal(teacher, assignment);
  }

  deleteAssignment(assignment: TeacherSubjectAssignments): void {
    if (!assignment.idTeacherSubjectAssignments) {
      Swal.fire('Error', 'No se pudo identificar la asignacion', 'error');
      return;
    }

    Swal.fire({
      title: '¿Eliminar asignacion?',
      text: 'Esta accion no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.assignmentsService.deleteTeacherSubjectAssignments(assignment.idTeacherSubjectAssignments).subscribe({
        next: () => {
          this.assignments = this.assignments.filter(
            (item) => item.idTeacherSubjectAssignments !== assignment.idTeacherSubjectAssignments
          );
          Swal.fire('Eliminado', 'La asignacion fue eliminada correctamente', 'success');
        },
        error: () => {
          Swal.fire('Error', 'No se pudo eliminar la asignacion', 'error');
        }
      });
    });
  }

  onTeacherSearch(value: string): void {
    this.teacherSearchText = value;
  }

  onTeacherChange(teacherId: string): void {
    const selected = this.allTeachers.find((item) => item.idTeacher === teacherId);
    if (selected) {
      this.teacherSearchText = this.getTeacherDisplayName(selected);
    }
  }

  onEducationLevelChange(): void {
    this.assignmentForm.patchValue({ degreeId: '', courseId: '' });
  }

  get isPrimaryOrInitialSelected(): boolean {
    const levelId = this.assignmentForm.controls.educationLevelId.value || '';
    return this.isPrimaryOrInitialByLevelId(levelId);
  }

  get filteredTeachers(): Teacher[] {
    const search = this.teacherSearchText.trim().toLowerCase();
    if (!search) {
      return this.allTeachers;
    }

    return this.allTeachers.filter((teacher) => {
      const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.toLowerCase();
      const dni = (teacher.user?.dni || '').toLowerCase();
      return fullName.includes(search) || dni.includes(search);
    });
  }

  get filteredDegreesByLevel(): Degree[] {
    const selectedLevelId = this.assignmentForm.controls.educationLevelId.value;
    if (!selectedLevelId) {
      return [];
    }
    return this.degrees.filter((degree) => degree.idEducationLevel === selectedLevelId);
  }

  get selectedTeacherAssignments(): TeacherSubjectAssignments[] {
    if (!this.selectedTeacherForAssignments?.idTeacher) {
      return [];
    }
    return this.assignments.filter((item) => item.teacherId === this.selectedTeacherForAssignments?.idTeacher);
  }

  getTeacherDisplayName(teacher: Teacher): string {
    const fullName = `${teacher.user?.name || ''} ${teacher.user?.lastname || ''}`.trim();
    const dni = teacher.user?.dni || 'Sin DNI';
    return `${fullName} - DNI: ${dni}`;
  }

  getTeacherNameById(idTeacher: string): string {
    const teacher = this.allTeachers.find((item) => item.idTeacher === idTeacher);
    return teacher ? this.getTeacherDisplayName(teacher) : idTeacher;
  }

  getEducationLevelNameById(idEducationLevel: string): string {
    const level = this.educationLevels.find((item) => item.idEducationLevel === idEducationLevel);
    console.log('Resolviendo nombre de nivel educativo para ID:', idEducationLevel, 'Encontrado:', level);
    return level ? `${level.name} - ${level.shift}` : idEducationLevel;
  }

  getEducationLevelNameByAssignment(assignment: TeacherSubjectAssignments): string {
    const resolvedLevelId = this.resolveEducationLevelFromAssignment(assignment);
    return resolvedLevelId ? this.getEducationLevelNameById(resolvedLevelId) : '-';
  }

  getDegreeNameById(idDegree: string): string {
    if (!idDegree) {
      return '-';
    }
    const degree = this.degrees.find((item) => item.idDegree === idDegree);
    return degree ? `${degree.course} - Seccion ${degree.section}` : idDegree;
  }

  getCourseNameById(idCourse: string): string {
    if (!idCourse) {
      return '-';
    }
    const course = this.courses.find((item) => item.idCourse === idCourse);
    return course ? course.name : idCourse;
  }

  private resolveEducationLevelFromAssignment(assignment?: TeacherSubjectAssignments): string {
    if (!assignment) {
      return '';
    }

    if (assignment.educationLevelId) {
      return assignment.educationLevelId;
    }

    if (assignment.degreeId) {
      const degree = this.degrees.find((item) => item.idDegree === assignment.degreeId);
      return degree?.idEducationLevel || '';
    }

    return '';
  }

  private isPrimaryOrInitialByLevelId(levelId: string): boolean {
    if (!levelId) {
      return false;
    }

    const level = this.educationLevels.find((item) => item.idEducationLevel === levelId);
    const normalizedType = String(level?.levelType || '').toUpperCase();
    if (normalizedType === 'PRIMARY' || normalizedType === 'INITIAL') {
      return true;
    }

    const normalizedName = (level?.name || '').toUpperCase();
    return normalizedName.includes('PRIMARIA') || normalizedName.includes('INICIAL') || normalizedName.includes('INITIAL') || normalizedName.includes('PRIMARY');
  }


}
