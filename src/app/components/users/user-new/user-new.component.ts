import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { User } from '../../../models/user';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-student-new',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './user-new.component.html',
  styleUrl: './user-new.component.css'
})
export class UserNewComponent {

  private roleService = inject(RoleService);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  userForm: FormGroup;
  error: string | null = null;
  lastName: string | null = null;
  roles: Role[] = [];
  isEditMode = false;
  userId: string | null = null;


  constructor(
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      name: ['', Validators.required],
      fatherLastName: ['', Validators.required],
      motherLastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('idUser');
    this.isEditMode = !!this.userId;
    this.init_data();
  }

  init_data() {
    this.get_roles();
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          dni: user.dni,
          name: user.name,
          fatherLastName: user.lastname.split(' ')[0],
          motherLastName: user.lastname.split(' ')[1],
          birthDate: user.birthDate,
          gender: user.gender,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.rolId
        });
      },
      error: (error) => {
        console.error('Error fetching user:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      if (this.isEditMode) {
        this.updateUser();
      } else {
        this.createUser();
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
    const dni = this.userForm.get('dni')?.value;
    if (!dni) {
      return;
    }

    this.userService.searchByDniApi(dni).subscribe({
      next: (data) => {
        this.userForm.patchValue({
          name: data.nombres,
          fatherLastName: data.apellidoPaterno,
          motherLastName: data.apellidoMaterno
        });
        this.error = null;
      },
      error: () => {
        this.error = 'DNI no encontrado';
        this.userForm.patchValue({
          name: '',
          fatherLastName: '',
          motherLastName: ''
        });
      }
    });
  }

  createUser(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.getRawValue();
      const body: User = {
        idUser: this.userId,
        name: formData.name,
        lastname: formData.fatherLastName + ' ' + formData.motherLastName,
        dni: formData.dni,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        photo: '',
        birthDate: formData.birthDate,
        gender: formData.gender,
        rolId: formData.role
      };

      console.log('Guardando usuario:', body);
      this.userService.saveUser(body).subscribe({
        next: (response) => {
          console.log('Usuario creado exitosamente:', response);
          Swal.fire({
            title: 'Éxito',
            text: 'Usuario creado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/user']);
        },
        error: (error) => {
          console.error('Error creando usuario:', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al crear el usuario. Por favor, intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });

      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete el formulario correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  updateUser(): void {
    if (this.userForm.valid && this.userId) {
      const formData = this.userForm.getRawValue();
      const body: User = {
        idUser: this.userId,
        name: formData.name,
        lastname: formData.fatherLastName + ' ' + formData.motherLastName,
        dni: formData.dni,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        photo: '',
        birthDate: formData.birthDate,
        gender: formData.gender,
        rolId: formData.role
      };
      this.userService.updateUser(body).subscribe({
        next: (response) => {
          console.log('Usuario actualizado exitosamente:', response);
          Swal.fire({
            title: 'Éxito',
            text: 'Usuario actualizado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/user']);
        }
        , error: (error) => {
          console.error('Error actualizando usuario:', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al actualizar el usuario. Por favor, intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

}
