import { Component, inject, Inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { Router, RouterLink } from '@angular/router';
import {NgFor} from '@angular/common';

@Component({
  selector: 'app-student-index',
  standalone: true,
  imports: [RouterLink, NgFor],
  templateUrl: './student-index.component.html',
  styleUrl: './student-index.component.css'
})
export class StudentIndexComponent {

  public users: User[] = [];
  private router = inject(Router); 

  constructor() { }

  private userService = inject(UserService);

  ngOnInit(): void {
    this.userService.getUsers().subscribe(
      response => {
        this.users = response;
        console.log(this.users);
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
