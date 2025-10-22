import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../../services/role.service';
import { Role } from '../../../models/role';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent {
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  user: User
  role: Role;

  ngOnInit() {
    if (typeof window !== 'undefined' && sessionStorage) {
      const dni = sessionStorage.getItem('dni');
      if (dni) {
        this.userService.getUserByDni(dni).subscribe(response => {
          this.user = response;
          this.role = this.searchRole(this.user.rolId);
        });
      }
    }
  }
  searchRole(roleId: string): Role {
    this.roleService.getRoleById(roleId).subscribe(
      response => {
        this.role = response;
      }
    );
    return this.role;
  }
}
