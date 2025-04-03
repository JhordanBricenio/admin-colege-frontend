import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [NgIf],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent {
  private userService= inject(UserService);

  student: User 

  ngOnInit() {
    const dni = sessionStorage.getItem('dni'); 
    if (dni) {
      this.userService.getUserByDni(dni).subscribe(response => {
        this.student = response;
      });
    }
  }
}
