import { Component, inject } from '@angular/core';
import { RoleService } from '../../../../services/role.service';
import { TeacherService } from '../../../../services/teacher.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Role } from '../../../../models/role';
import { Teacher } from '../../../../models/teacher';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-teacher-new',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './teacher-new.component.html',
  styleUrl: './teacher-new.component.css'
})
export class TeacherNewComponent {


  private roleService = inject(RoleService);
  private teacherService = inject(TeacherService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  teacherForm: FormGroup;
  error: string | null = null;
  lastName: string | null = null;
  roles: Role[] = [];
  isEditMode = false;
  teacherId: string | null = null;
  userId: string | null = null;


  constructor(
    private fb: FormBuilder
  ) {
    this.teacherForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      name: ['', Validators.required],
      fatherLastName: ['', Validators.required],
      motherLastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      specialty: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.teacherId = this.route.snapshot.paramMap.get('idTeacher');
    this.isEditMode = !!this.teacherId;
    this.init_data();
  }

  init_data() {
    this.get_roles();
    if (this.isEditMode && this.teacherId) {
      this.teacherService.getUserById(this.teacherId).subscribe({
        next: (teacher) => {
          this.userId = teacher.user.idUser;
          this.teacherForm.patchValue({
            dni: teacher.user.dni,
            name: teacher.user.name,
            fatherLastName: teacher.user.lastname.split(' ')[0],
            motherLastName: teacher.user.lastname.split(' ')[1],
            birthDate: teacher.user.birthDate,
            gender: teacher.user.gender,
            email: teacher.user.email,
            phone: teacher.user.phone,
            address: teacher.user.address,
            specialty: teacher.specialty,
            role: teacher.user.rolId
          });
        },
        error: (error) => {
          console.error('Error fetching teacher:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.teacherForm.valid) {
      if (this.isEditMode) {
        this.updateteacher();
      } else {
        this.createteacher();
      }
    }
  }

  get_roles() {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        console.log('Roles fetched:', roles);
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      }
    });
  }

  buscar() {
    const dni = this.teacherForm.get('dni')?.value;
    if (!dni) {
      return;
    }

    this.teacherService.searchByDniApi(dni).subscribe({
      next: (data) => {
        this.teacherForm.patchValue({
          name: data.nombres,
          fatherLastName: data.apellidoPaterno,
          motherLastName: data.apellidoMaterno
        });
        this.error = null;
      },
      error: () => {
        this.error = 'DNI no encontrado';
        this.teacherForm.patchValue({
          name: '',
          fatherLastName: '',
          motherLastName: ''
        });
      }
    });
  }

  createteacher(): void {
    if (this.teacherForm.valid) {
      const formData = this.teacherForm.getRawValue();
      const body: any = {
        specialty: formData.specialty,
        user: {
          dni: formData.dni,
          name: formData.name,
          lastname: formData.fatherLastName + ' ' + formData.motherLastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          photo: '',
          birthDate: formData.birthDate,
          gender: formData.gender,
          rolId: formData.role
        }
      };
      this.teacherService.saveUser(body).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Profesor creado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/teacher']);
        },
        error: (error) => {
          console.error('Error creando profesor:', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al crear el profesor. Por favor, intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    } else {
      Object.keys(this.teacherForm.controls).forEach(key => {
        this.teacherForm.get(key)?.markAsTouched();
      });

      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete el formulario correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  updateteacher(): void {
    if (this.teacherForm.valid && this.teacherId) {
      const formData = this.teacherForm.getRawValue();
      console.log('Datos del formulario para actualización:', formData);
      const body: any = {
        idTeacher: this.teacherId,
        specialty: formData.specialty,
        user: {
          idUser: this.userId,
          dni: formData.dni,
          name: formData.name,
          lastname: formData.fatherLastName + ' ' + formData.motherLastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          photo: '',
          birthDate: formData.birthDate,
          gender: formData.gender,
          rolId: formData.role
        }
      };
      this.teacherService.updateUser(body).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Profesor actualizado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/teacher']);
        },
        error: (error) => {
          console.error('Error actualizando profesor:', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al actualizar el profesor. Por favor, intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    } else {
      Object.keys(this.teacherForm.controls).forEach(key => {
        this.teacherForm.get(key)?.markAsTouched();
      });
    }
  }

}
