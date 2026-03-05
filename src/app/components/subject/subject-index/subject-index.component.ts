import { Component, inject } from '@angular/core';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subject-index',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterLink],
  templateUrl: './subject-index.component.html',
  styleUrl: './subject-index.component.css'
})
export class SubjectIndexComponent {


  public courses: Course[] = [];

  constructor() { }

  private courseService = inject(CourseService);

  ngOnInit(): void {

    this.initData();
  }

  initData(): void {
    this.courseService.getCourses().subscribe((data) => {
      console.log(data);
      this.courses = data;
    });
  }

  deleteCourse(id: string): void {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.courseService.deleteCourse(id).subscribe(
          {
            next: () => {
              this.courses = this.courses.filter(course => course.idCourse !== id);
              Swal.fire({
                title: "¡Eliminado!",
                text: "El curso ha sido eliminado con éxito.",
                icon: "success"
              });
              this.initData();
            },
            error: (error) => {
              console.log(error);
              Swal.fire({
                title: "Error",
                text: "Hubo un problema al eliminar el curso.",
                icon: "error"
              });
            }
          });
      }
    });
  }
}
