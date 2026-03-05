import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistrationService } from '../../../services/registration.service';
import { UserService } from '../../../services/user.service';
import { DegreeService } from '../../../services/degree.service';
import { EducationLevelService } from '../../../services/education-level.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgFor, NgIf } from '@angular/common';
import { Student } from '../../../models/student';
import { Degree } from '../../../models/degree';
import { EducationLevel } from '../../../models/education-level';
import { User } from '../../../models/user';

@Component({
  selector: 'app-registration-create',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './registration-create.component.html',
  styleUrl: './registration-create.component.css'
})
export class RegistrationCreateComponent {

  students: User[] = [];
  degrees: Degree[] = [];
  educationLevels: EducationLevel[] = [];
  parents: User[] = [];

  filteredStudents: User[] = [];
  filteredParents: User[] = [];

  studentSearchControl = new FormControl('');
  parentSearchControl = new FormControl('');

  private fb = inject(FormBuilder);
  private registrationService = inject(RegistrationService);
  private userService = inject(UserService);
  private degreeService = inject(DegreeService);
  private educationLevelService = inject(EducationLevelService);
  private router = inject(Router);

  isLoading = false;

  registrationForm = this.fb.nonNullable.group({
    idStudent: ['', Validators.required],
    idDegree: ['', Validators.required],
    idParent: ['', Validators.required],
    idEducationLevel: ['', Validators.required],
    status: ['ACTIVE', Validators.required],
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
    // Configurar autocomplete para estudiantes
    this.studentSearchControl.valueChanges.subscribe(searchTerm => {
      this.filterStudents(searchTerm || '');
    });

    // Configurar autocomplete para padres
    this.parentSearchControl.valueChanges.subscribe(searchTerm => {
      this.filterParents(searchTerm || '');
    });
  }

  filterStudents(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredStudents = this.students.slice(0, 10); // Mostrar solo primeros 10
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(student => {
      const fullName = `${student.name} ${student.lastname}`.toLowerCase();
      return fullName.includes(term);
    }).slice(0, 10); // Limitar resultados a 10
  }

  filterParents(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredParents = this.parents.slice(0, 10); // Mostrar solo primeros 10
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredParents = this.parents.filter(parent => {
      const fullName = `${parent.name} ${parent.lastname}`.toLowerCase();
      return fullName.includes(term);
    }).slice(0, 10); // Limitar resultados a 10
  }

  selectStudent(student: User): void {
    this.registrationForm.patchValue({ idStudent: student.idUser.toString() });
    this.studentSearchControl.setValue(`${student.name} ${student.lastname}`);
    this.filteredStudents = [];
  }

  selectParent(parent: User): void {
    this.registrationForm.patchValue({ idParent: parent.idUser.toString() });
    this.parentSearchControl.setValue(`${parent.name} ${parent.lastname}`);
    this.filteredParents = [];
  }

  loadStudents() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        console.log('Loaded students:', data);
        this.students = data;
        this.filteredStudents = data.slice(0, 10); // Inicializar con primeros 10
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
        console.log('Loaded degrees:', data);
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
        console.log('Loaded education levels:', data);
        this.educationLevels = data;
      },
      error: (error) => {
        console.error('Error loading education levels:', error);
        Swal.fire('Error', 'No se pudieron cargar los niveles educativos', 'error');
      }
    });
  }

  loadParents() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        console.log('Loaded parents:', data);
        this.parents = data;
        this.filteredParents = data.slice(0, 10); // Inicializar con primeros 10
      },
      error: (error) => {
        console.error('Error loading parents:', error);
        Swal.fire('Error', 'No se pudieron cargar los apoderados', 'error');
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
    const body = this.registrationForm.getRawValue();

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

}
