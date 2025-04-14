import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DegreeService } from '../../../services/degree.service';
import { Course } from '../../../models/course';
import { Degree } from '../../../models/degree';
import { CourseService } from '../../../services/course.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-assign-course',
  standalone: true,
  imports: [NgFor],
  templateUrl: './assign-course.component.html',
  styleUrl: './assign-course.component.css'
})
export class AssignCourseComponent {

  private route = inject(ActivatedRoute);
  private degreeService = inject(DegreeService);
  private courseService = inject(CourseService);
  public courses: Course[] = [];
  public degree :Degree;


  constructor() { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.degreeService.getDegree(+id).subscribe(degree => {
        this.degree = degree;
      })     
    });

    this.initData();
    
  }

  initData() {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses;
    });
  }


}
