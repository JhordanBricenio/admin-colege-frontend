import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistrationService } from '../../../services/registration.service';
import { DegreeService } from '../../../services/degree.service';
import { EducationLevelService } from '../../../services/education-level.service';
import { StudentService } from '../../../services/student.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Student } from '../../../models/student';
import { Parent } from '../../../models/parent';
import { Registration } from '../../../models/registration';
import { Degree } from '../../../models/degree';
import { EducationLevel } from '../../../models/education-level';
import { User } from '../../../models/user';
import { ParentService } from '../../../services/parent.service';

@Component({
  selector: 'app-registration-create',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, DatePipe],
  templateUrl: './registration-create.component.html',
  styleUrl: './registration-create.component.css'
})
export class RegistrationCreateComponent implements OnInit {

  students: Student[] = [];
  degrees: Degree[] = [];
  educationLevels: EducationLevel[] = [];
  parents: Parent[] = [];

  filteredStudents: Student[] = [];
  filteredParents: Parent[] = [];

  selectedStudent: Student | null = null;
  selectedParent: Parent | null = null;

  studentSearchControl = new FormControl('');
  parentSearchControl = new FormControl('');

  private fb = inject(FormBuilder);
  private registrationService = inject(RegistrationService);
  private studentService = inject(StudentService);
  private parentService = inject(ParentService);
  private degreeService = inject(DegreeService);
  private educationLevelService = inject(EducationLevelService);
  private router = inject(Router);

  isLoading = false;

  registrationForm = this.fb.nonNullable.group({
    student: ['', Validators.required],
    parent: ['', Validators.required],
    status: [true, Validators.required],
    registrationDate: [this.getCurrentDate(), Validators.required],
  });

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadDegrees();
    this.loadEducationLevels();
    this.loadParents();
    this.setupAutocomplete();
  }

  setupAutocomplete(): void {
    this.studentSearchControl.valueChanges.subscribe(searchTerm => {
      this.filterStudents(searchTerm || '');
    });

    this.parentSearchControl.valueChanges.subscribe(searchTerm => {
      this.filterParents(searchTerm || '');
    });
  }

  filterStudents(searchTerm: string): void {
    const term = this.normalizeText(searchTerm).trim();

    if (!term) {
      this.filteredStudents = this.students.slice(0, 10);
      return;
    }

    this.filteredStudents = this.students.filter(student => {
      const fullName = this.getStudentFullName(student);
      const code = this.normalizeText(student?.code);
      const dni = this.normalizeText(student?.user?.dni);
      return fullName.includes(term) || code.includes(term) || dni.includes(term);
    }).slice(0, 10);
  }

  filterParents(searchTerm: string): void {
    const term = this.normalizeText(searchTerm).trim();

    if (!term) {
      this.filteredParents = this.parents.slice(0, 10);
      return;
    }

    this.filteredParents = this.parents.filter(parent => {
      const fullName = this.getParentFullName(parent);
      const dni = this.normalizeText(parent?.user?.dni);
      return fullName.includes(term) || dni.includes(term);
    }).slice(0, 10);
  }

  selectStudent(student: Student): void {
    this.selectedStudent = student;
    this.registrationForm.patchValue({ student: student.idStudent });
    this.studentSearchControl.setValue(this.getStudentFullName(student));
    this.filteredStudents = [];
  }

  selectParent(parent: Parent): void {
    this.selectedParent = parent;
    this.registrationForm.patchValue({ parent: parent.idParent });
    this.parentSearchControl.setValue(this.getParentFullName(parent));
    this.filteredParents = [];
  }

  loadStudents() {
    this.studentService.getUsers().subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = data.slice(0, 10);
      },
      error: (error) => {
        console.error('Error loading students:', error);
        Swal.fire('Error', 'No se pudieron cargar los estudiantes', 'error');
      }
    });
  }

  loadDegrees() {
    this.degreeService.getDegrees().subscribe({
      next: (data) => {
        this.degrees = data;

      },
      error: (error) => {
        console.error('Error loading degrees:', error);
        Swal.fire('Error', 'No se pudieron cargar los grados', 'error');
      }
    });
  }

  loadEducationLevels() {
    this.educationLevelService.getEducationLevels().subscribe({
      next: (data) => {
        this.educationLevels = data;
      },
      error: (error) => {
        console.error('Error loading education levels:', error);
        Swal.fire('Error', 'No se pudieron cargar los niveles educativos', 'error');
      }
    });
  }

  loadParents() {
    this.parentService.getUsers().subscribe({
      next: (data) => {
        this.parents = data;
        this.filteredParents = data.slice(0, 10);
      },
      error: (error) => {
        console.error('Error loading parents:', error);
        Swal.fire('Error', 'No se pudieron cargar los padres', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.createRegistration();
    } else {
      Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
    }
  }

  createRegistration() {
    this.isLoading = true;
    const formValue = this.registrationForm.getRawValue();
    const body: any = {
      idStudent: this.selectedStudent.idStudent!,
      idParent: this.selectedParent.idParent!,
      status: formValue.status
    };
    this.registrationService.createRegistration(body).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Matrícula registrada correctamente',
          timer: 1500
        }).then(() => {
          this.router.navigate(['/admin/registration']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating registration:', error);
        Swal.fire('Error', 'No se pudo registrar la matrícula', 'error');
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/registration']);
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '').toLowerCase();
  }

  private getStudentFullName(student: Student | null | undefined): string {
    const name = this.normalizeText(student?.user?.name).trim();
    const lastname = this.normalizeText(student?.user?.lastname).trim();
    return `${name} ${lastname}`.trim();
  }

  private getParentFullName(parent: Parent | null | undefined): string {
    const name = this.normalizeText(parent?.user?.name).trim();
    const lastname = this.normalizeText(parent?.user?.lastname).trim();
    return `${name} ${lastname}`.trim();
  }

}
