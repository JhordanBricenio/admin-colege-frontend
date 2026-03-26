import { Component, inject, OnInit } from '@angular/core';
import { RoleService } from '../../../../services/role.service';
import { StudentService } from '../../../../services/student.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../../../../models/role';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Degree } from '../../../../models/degree';
import { EducationLevel } from '../../../../models/education-level';
import { DegreeService } from '../../../../services/degree.service';
import { EducationLevelService } from '../../../../services/education-level.service';

@Component({
  selector: 'app-students-new',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './students-new.component.html',
  styleUrl: './students-new.component.css'
})
export class StudentsNewComponent implements OnInit {

  private roleService = inject(RoleService);
  private studentService = inject(StudentService);
  private degreeService = inject(DegreeService);
  private educationLevelService = inject(EducationLevelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  studentForm: FormGroup;
  error: string | null = null;
  roles: Role[] = [];
  degrees: Degree[] = [];
  educationLevels: EducationLevel[] = [];
  isEditMode = false;
  studentId: string | null = null;
  userId: string | null = null;
  isLoading = false;
  isSearching = false;

  constructor(private fb: FormBuilder) {
    this.studentForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      name: ['', Validators.required],
      fatherLastName: ['', Validators.required],
      motherLastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      role: ['', Validators.required],
      degree: ['', Validators.required],
      educationLevel: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('idStudent');
    this.isEditMode = !!this.studentId;
    this.init_data();
  }

  init_data(): void {
    this.get_roles();
    this.get_degrees();
    this.get_education_levels();
    if (this.isEditMode && this.studentId) {
      this.studentService.getUserById(this.studentId).subscribe({
        next: (student) => {
          this.userId = student.user.idUser;
          this.studentForm.patchValue({
            dni: student.user.dni,
            name: student.user.name,
            fatherLastName: student.user.lastname.split(' ')[0],
            motherLastName: student.user.lastname.split(' ')[1] ?? '',
            birthDate: student.user.birthDate,
            gender: student.user.gender,
            email: student.user.email,
            phone: student.user.phone,
            address: student.user.address,
            role: student.user.rolId,
            degree: student.degree?.idDegree ?? '',
            educationLevel: student.educationLevel?.idEducationLevel ?? '',
            status: student.status
          });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cargar los datos del estudiante', 'error');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      if (this.isEditMode) {
        this.updateStudent();
      } else {
        this.createStudent();
      }
    } else {
      Object.keys(this.studentForm.controls).forEach(key => {
        this.studentForm.get(key)?.markAsTouched();
      });
      Swal.fire('Formulario incompleto', 'Por favor, complete todos los campos requeridos.', 'warning');
    }
  }

  get_roles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => { this.roles = roles; },
      error: () => { Swal.fire('Error', 'No se pudieron cargar los roles', 'error'); }
    });
  }

  get_degrees(): void {
    this.degreeService.getDegrees().subscribe({
      next: (degrees) => { this.degrees = degrees; },
      error: () => { Swal.fire('Error', 'No se pudieron cargar los grados', 'error'); }
    });
  }

  get_education_levels(): void {
    this.educationLevelService.getEducationLevels().subscribe({
      next: (educationLevels) => { this.educationLevels = educationLevels; },
      error: () => { Swal.fire('Error', 'No se pudieron cargar los niveles educativos', 'error'); }
    });
  }

  buscar(): void {
    const dni = this.studentForm.get('dni')?.value;
    if (!dni) return;

    this.isSearching = true;
    this.error = null;
    this.studentService.searchByDniApi(dni).subscribe({
      next: (data) => {
        this.isSearching = false;
        this.studentForm.patchValue({
          name: data.nombres,
          fatherLastName: data.apellidoPaterno,
          motherLastName: data.apellidoMaterno
        });
      },
      error: () => {
        this.isSearching = false;
        this.error = 'DNI no encontrado en RENIEC';
        this.studentForm.patchValue({ name: '', fatherLastName: '', motherLastName: '' });
      }
    });
  }

  createStudent(): void {
    this.isLoading = true;
    const formData = this.studentForm.getRawValue();
    const body: any = {
      status: formData.status,
      idDegree: formData.degree,
      idEducationLevel: formData.educationLevel,
      user: {
        dni: formData.dni,
        name: formData.name,
        lastname: `${formData.fatherLastName} ${formData.motherLastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        photo: '',
        birthDate: formData.birthDate,
        gender: formData.gender,
        rolId: formData.role
      }
    };
    console.log('Creating student with data:', body);
    this.studentService.saveUser(body).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({ title: 'Éxito', text: 'Estudiante registrado exitosamente', icon: 'success', confirmButtonText: 'Aceptar' })
          .then(() => this.router.navigate(['/admin/student']));
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creando estudiante:', error);
        Swal.fire('Error', 'No se pudo registrar el estudiante. Intente nuevamente.', 'error');
      }
    });
  }

  updateStudent(): void {
    this.isLoading = true;
    const formData = this.studentForm.getRawValue();
    const body: any = {
      idStudent: this.studentId,
      status: formData.status,
      degree: { idDegree: formData.degree },
      educationLevel: { idEducationLevel: formData.educationLevel },
      user: {
        idUser: this.userId,
        dni: formData.dni,
        name: formData.name,
        lastname: `${formData.fatherLastName} ${formData.motherLastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        photo: '',
        birthDate: formData.birthDate,
        gender: formData.gender,
        rolId: formData.role
      }
    };
    this.studentService.updateUser(body).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({ title: 'Éxito', text: 'Estudiante actualizado exitosamente', icon: 'success', confirmButtonText: 'Aceptar' })
          .then(() => this.router.navigate(['/admin/student']));
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error actualizando estudiante:', error);
        Swal.fire('Error', 'No se pudo actualizar el estudiante. Intente nuevamente.', 'error');
      }
    });
  }
}
