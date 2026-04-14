import { Component, inject } from '@angular/core';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { EducationLevelService } from '../../../services/education-level.service';
import { EducationLevel } from '../../../models/education-level';

@Component({
  selector: 'app-subject-index',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterLink],
  templateUrl: './subject-index.component.html',
  styleUrl: './subject-index.component.css'
})
export class SubjectIndexComponent {


  public courses: Course[] = [];
  public allCourses: Course[] = [];
  public educationLevels: EducationLevel[] = [];

  constructor() { }

  private courseService = inject(CourseService);
  private educationLevelService = inject(EducationLevelService);

  ngOnInit(): void {

    this.initData();
  }

  initData(): void {
    this.courseService.getCourses().subscribe((data) => {
      console.log(data);
      this.allCourses = data || [];
      this.courses = [...this.allCourses];
    });

    this.educationLevelService.getEducationLevels().subscribe((data) => {
      this.educationLevels = data || [];
    });
  }

  onSearch(name: string): void {
    const query = (name || '').trim().toLowerCase();
    if (!query) {
      this.courses = [...this.allCourses];
      return;
    }

    this.courses = this.allCourses.filter((course) => {
      const courseName = (course.name || '').toLowerCase();
      const levelName = this.getEducationLevelNameById(course.educationLevelId).toLowerCase();
      return courseName.includes(query) || levelName.includes(query);
    });
  }

  getEducationLevelNameById(educationLevelId?: string): string {
    if (!educationLevelId) {
      return '-';
    }
    const level = this.educationLevels.find((item) => String(item.idEducationLevel) === String(educationLevelId));
    return level ? `${level.name} - ${level.shift}` : educationLevelId;
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
