import { Component, inject } from '@angular/core';
import { DegreeService } from '../../../services/degree.service';
import { NgFor, NgIf } from '@angular/common';
import { Degree } from '../../../models/degree';
import { Course } from '../../../models/course';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-degrees-index',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './degrees-index.component.html',
  styleUrl: './degrees-index.component.css'
})
export class DegreesIndexComponent {

   public degrees: Degree[] = [];
   showCursos = false;
   selectedDegreeId: number | null = null;
   courses: Course[] = [];

  constructor() { }

  private degreeService = inject(DegreeService);


  ngOnInit(): void {
    this.degreeService.getDegrees().subscribe((data) => {
      this.degrees = data;
    });
  }

  toggleCourses(idDegree: number): void {
    if (this.showCursos && this.selectedDegreeId === idDegree) {
      this.showCursos = false;
      this.selectedDegreeId = null;
      this.courses = [];
    } else {
      this.selectedDegreeId = idDegree;
      this.degreeService.getDegreesWithCourses(idDegree).subscribe((data) => {
        this.courses = data.courses;
        console.log(this.courses);
        this.showCursos = true;
      });
    }
  }
}
