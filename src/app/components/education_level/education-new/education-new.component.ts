import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EducationLevelService } from '../../../services/education-level.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { NgFor, NgIf } from '@angular/common';
import { ManagementService } from '../../../services/management.service';
import { Management } from '../../../models/management';

@Component({
  selector: 'app-education-new',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink, NgFor],
  templateUrl: './education-new.component.html',
  styleUrl: './education-new.component.css'
})
export class EducationNewComponent {


  managements: Management[] = [];

  private fb = inject(FormBuilder);
  private educationLevelService = inject(EducationLevelService);
  private managementService = inject(ManagementService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  educationLevelId: string | null = null;

  constructor() { }

  educationLevelForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    levelType: ['', Validators.required],
    shift: ['', Validators.required],
    status: [true, Validators.required],
    idManagement: ['', Validators.required],
  });

  ngOnInit(): void {
    this.educationLevelId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.educationLevelId;
    this.loadEducationLevelData();
    this.loadManagements();


  }

  onSubmit(): void {
    if (this.educationLevelForm.valid) {
      if (this.isEditMode) {
        this.updateEducationLevel();
      } else {
        this.createEducationLevel();
      }
    }
  }

  loadEducationLevelData() {
    if (this.educationLevelId) {
      this.educationLevelService.getEducationLevelById(this.educationLevelId).subscribe({
        next: (educationLevel) => {
          this.educationLevelForm.setValue({
            name: educationLevel.name,
            levelType: educationLevel.levelType,
            shift: educationLevel.shift,
            status: educationLevel.status,
            idManagement: educationLevel.idManagement,
          });
        },
        error: (error) => {
          console.error('Error fetching education level:', error);
        }
      });
    }
  }


  createEducationLevel() {
    if (this.educationLevelForm.valid) {
      const body = this.educationLevelForm.getRawValue();
      this.educationLevelService.createEducationLevel(body).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Nivel educativo creado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/education-level']);
        },
        error: (error) => {
          console.error('Error fetching education level:', error);
        }
      });
    }
  }

  updateEducationLevel() {
    if (this.educationLevelForm.valid) {
      const body = this.educationLevelForm.getRawValue();
      this.educationLevelService.updateEducationLevel(this.educationLevelId, body).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Nivel educativo actualizado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/education-level']);
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

  private loadManagements() {
    this.managementService.getManagements().subscribe({
      next: (data) => {
        this.managements = data;
      },
      error: (error) => {
        console.error('Error loading managements:', error);
      }
    });
  }
}
