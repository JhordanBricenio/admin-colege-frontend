import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ManagementService } from '../../../../services/management.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-management-new',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './management-new.component.html',
  styleUrl: './management-new.component.css'
})
export class ManagementNewComponent {
  private fb = inject(FormBuilder);
  private roleService = inject(ManagementService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  idManagement: string | null = null;

  constructor() { }

  managementForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    status: [true, Validators.required],
    createdAt: [''],
  });

  ngOnInit(): void {
    this.idManagement = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.idManagement;
    this.loadManagementData();


  }

  onSubmit(): void {
    if (this.managementForm.valid) {
      if (this.isEditMode) {
        this.updateManagement();
      } else {
        this.createManagement();
      }
    }
  }

  loadManagementData() {
    if (this.idManagement) {
      this.roleService.getManagementById(this.idManagement).subscribe({
        next: (management) => {
          this.managementForm.setValue({
            name: management.name,
            status: management.status,
            createdAt: management.createdAt || '',
          });
        },
        error: (error) => {
          console.error('Error fetching role:', error);
        }
      });
    }
  }


  createManagement() {
    if (this.managementForm.valid) {
      const body = this.managementForm.getRawValue();
      this.roleService.createManagement(body).subscribe({
        next: (response) => {
          console.log('Management created successfully:', response);
          Swal.fire({
            title: 'Éxito',
            text: 'Gestión creada exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/managements']);
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: error.error?.message || 'No se pudo crear la gestión.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
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

  updateManagement() {
    if (this.managementForm.valid) {
      const body = this.managementForm.getRawValue();
      this.roleService.updateManagement(this.idManagement, body).subscribe({
        next: (response) => {
          console.log('Management updated successfully:', response);
          Swal.fire({
            title: 'Éxito',
            text: 'Gestión actualizada exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/managements']);
        },
        error: (error) => {
          console.error('Error updating management:', error);
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
