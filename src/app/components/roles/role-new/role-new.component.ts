import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService } from '../../../services/role.service';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-role-new',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink],
  templateUrl: './role-new.component.html',
  styleUrl: './role-new.component.css'
})
export class RoleNewComponent {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  roleId: string | null = null;

  // Opciones de roles predefinidas del backend
  roleOptions = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'TUTOR'];

  // Mapa de traducción para mostrar en español
  roleLabels: { [key: string]: string } = {
    'ADMIN': 'Administrador',
    'TEACHER': 'Profesor',
    'STUDENT': 'Estudiante',
    'PARENT': 'Padre/Madre',
    'TUTOR': 'Tutor'
  };

  constructor() { }

  roleForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    status: [true, Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.roleId;
    this.loadRoleData();


  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      if (this.isEditMode) {
        this.updateRole();
      } else {
        this.createRole();
      }
    }
  }

  loadRoleData() {
    if (this.roleId) {
      this.roleService.getRoleById(this.roleId).subscribe({
        next: (role) => {
          this.roleForm.setValue({
            name: role.name,
            status: role.status,
            description: role.description || '',
          });
        },
        error: (error) => {
          console.error('Error fetching role:', error);
        }
      });
    }
  }


  createRole() {
    if (this.roleForm.valid) {
      const body = this.roleForm.getRawValue();
      this.roleService.createRole(body).subscribe({
        next: (response) => {
          console.log('Role created successfully:', response);
          Swal.fire({
            title: 'Éxito',
            text: 'Rol creado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/role']);
        },
        error: (error) => {
          console.error('Error creating role:', error);
        }
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete el formulario correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  updateRole() {
    if (this.roleForm.valid) {
      const body = this.roleForm.getRawValue();
      console.log('Updating role with ID:', this.roleId, 'and data:', body);
      this.roleService.updateRole(this.roleId, body).subscribe({
        next: (response) => {
          console.log('Role updated successfully:', response);
          Swal.fire({
            title: 'Éxito',
            text: 'Rol actualizado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/role']);
        },
        error: (error) => {
          console.error('Error updating role:', error);
        }
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete el formulario correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }

  }
}
