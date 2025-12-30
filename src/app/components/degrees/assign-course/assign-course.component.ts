import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DegreeService } from '../../../services/degree.service';
import { Course } from '../../../models/course';
import { Degree } from '../../../models/degree';
import { CourseService } from '../../../services/course.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-assign-course',
  standalone: true,
  imports: [NgFor, RouterLink, NgIf],
  templateUrl: './assign-course.component.html',
  styleUrl: './assign-course.component.css'
})
export class AssignCourseComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private degreeService = inject(DegreeService);
  private courseService = inject(CourseService);
  public courses: Course[] = [];
  public degree: Degree;
  allCourses: Course[] = [];

  selectedCourses: number[] = [];
  assignedCourses: Course[] = [];


  constructor() { }

  ngOnInit(): void {
    this.initData();
  }

  initData() {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.degreeService.getDegree(id).subscribe(degree => {
        this.degree = degree;
      })
    });
    this.courseService.getCourses().subscribe(courses => {
      this.allCourses = courses;
    });
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.getCourses(id);
    });
  }


  getCourses(idDegree: string | null) {
    if (!idDegree) return;
    this.degreeService.getDegreesWithCourses(+idDegree).subscribe((data) => {
      this.courses = data.courses;
      this.assignedCourses = data.courses.map((course: any) => course);
      this.selectedCourses = this.assignedCourses.map(course => course.idCourse);
    });
  }

  onCheckboxChange(event: any, courseId: number): void {
    if (event.target.checked) {
      if (!this.selectedCourses.includes(courseId)) {
        this.selectedCourses.push(courseId);
      }
    } else {
      this.selectedCourses = this.selectedCourses.filter(id => id !== courseId);
    }
  }


  registrarCursos(): void {
    const payload = this.selectedCourses.map(id => ({ courseId: id }));
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.degreeService.assignCoursesToDegree(id, payload).subscribe({
        next: () => {
          alert('Cursos asignados correctamente');
          this.selectedCourses = [];
          this.router.navigate(['/admin/degree']);
        },
        error: err => {
          console.error('Error al asignar cursos', err);
        }
      });
    }
    )
  }


}
