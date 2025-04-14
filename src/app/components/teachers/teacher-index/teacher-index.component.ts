import { Component, inject } from '@angular/core';
import { User } from '../../../models/user';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-teacher-index',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './teacher-index.component.html',
  styleUrl: './teacher-index.component.css'
})
export class TeacherIndexComponent {
public teachers: User[] = [];
  private router = inject(Router); 

  constructor() { }

  private userService = inject(UserService);

  ngOnInit(): void {
    this.userService.getUsers().subscribe(
      response => {
        this.teachers = response;
        console.log(this.teachers);
      },
      error => {
        console.log(error);
      }
    );

  }

  verStudent(dni: string) {
    sessionStorage.setItem('dni', dni);
    this.router.navigate(['/admin/student/detail']); 
  }
}
