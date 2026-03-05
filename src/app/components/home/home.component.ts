import { Component, inject, Inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Role } from '../../models/role';
import { RoleService } from '../../services/role.service';
import { Course } from '../../models/course';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {


  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private courseService = inject(CourseService);

  users: User[] = [];
  roles: Role[] = [];
  courses: Course[] = [];

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadCourses();
  }

  private loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }
  private loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (response) => {
        this.roles = response;
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      }
    });
  }

  private loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (response) => {
        this.courses = response;
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      }
    });
  }

}
