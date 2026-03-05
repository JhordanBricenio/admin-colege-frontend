import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subject-new',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink, NgFor],
  templateUrl: './subject-new.component.html',
  styleUrl: './subject-new.component.css'
})
export class SubjectNewComponent {

  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  idCourse: string | null = null;


  courseForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    status: [true, Validators.required],
  });

  ngOnInit(): void {
    this.idCourse = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.idCourse;
    if (this.isEditMode && this.idCourse) {
      this.loadCourseData(this.idCourse);
    }
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      if (this.isEditMode) {
        this.updateCourse();
      } else {
        this.createCourse();
      }
    }
  }

  loadCourseData(id: string): void {
    this.courseService.getCourse(id).subscribe((data) => {
      this.courseForm.patchValue({
        name: data.name,
        status: data.status,
      });
    });
  }

  createCourse() {
    if (this.courseForm.valid) {
      const body = this.courseForm.getRawValue();
      this.courseService.createCourse(body).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Grado creado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/subject']);
        },
        error: (error) => {
          console.error('Error creating course:', error);
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
  updateCourse() {
    if (this.courseForm.valid && this.idCourse) {
      const body = this.courseForm.getRawValue();
      console.log('Updating Course with data:', body);
      this.courseService.updateCourse(this.idCourse, body).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Curso actualizado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/admin/subject']);
        },
        error: (error) => {
          console.error('Error updating course:', error);
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
