import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DegreeService } from '../../../services/degree.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { EducationLevelService } from '../../../services/education-level.service';
import { EducationLevel } from '../../../models/education-level';

@Component({
  selector: 'app-degree-new',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink, NgFor],
  templateUrl: './degree-new.component.html',
  styleUrl: './degree-new.component.css'
})
export class DegreeNewComponent {


  private fb = inject(FormBuilder);
  private degreeService = inject(DegreeService);
  private educationLevelService = inject(EducationLevelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  educationLevels: EducationLevel[] = [];
  isEditMode = false;
  idDegree: string | null = null;

  constructor() { }


  degreeForm = this.fb.nonNullable.group({
    course: ['', [Validators.required, Validators.minLength(3)]],
    section: ['', Validators.required],
    status: [true, Validators.required],
    idEducationLevel: ['', Validators.required],
  });

  ngOnInit(): void {
    this.idDegree = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.idDegree;
    this.loadEducationLevels();
    if (this.isEditMode && this.idDegree) {
      this.loadDegreeData();
    }
  }
  onSubmit(): void {
    if (this.degreeForm.valid) {
      if (this.isEditMode) {
        this.updateDegree();
      } else {
        this.createDegree();
      }
    }
  }
  createDegree() {
    if (this.degreeForm.valid) {
      const body = this.degreeForm.getRawValue();
      this.degreeService.createDegree(body).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Grado creado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/degree']);
        },
        error: (error) => {
          console.error('Error creating degree:', error);
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

  loadEducationLevels() {
    this.educationLevelService.getEducationLevels().subscribe({
      next: (levels) => {
        this.educationLevels = levels;
      },
      error: (error) => {
        console.error('Error loading education levels:', error);
      }
    });
  }

  loadDegreeData() {
    if (!this.idDegree) return;

    this.degreeService.getDegree(this.idDegree).subscribe({
      next: (degree) => {
        this.degreeForm.patchValue({
          course: degree.course,
          section: degree.section,
          status: degree.status,
          idEducationLevel: degree.idEducationLevel
        });
      },
      error: (error) => {
        console.error('Error loading degree data:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar los datos del grado',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  updateDegree() {
    if (this.degreeForm.valid && this.idDegree) {
      const body = this.degreeForm.getRawValue();
      console.log('Updating Degree with data:', body);
      this.degreeService.updateDegree(this.idDegree, body).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Grado actualizado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/degree']);
        },
        error: (error) => {
          console.error('Error updating degree:', error);
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