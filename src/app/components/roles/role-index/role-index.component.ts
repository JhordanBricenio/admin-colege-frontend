import { Component, inject } from '@angular/core';
import { Role } from '../../../models/role';
import { Router, RouterLink } from '@angular/router';
import { RoleService } from '../../../services/role.service';
import { NgFor, NgIf } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role-index',
  standalone: true,
  imports: [NgFor, RouterLink, NgIf],
  templateUrl: './role-index.component.html',
  styleUrl: './role-index.component.css'
})
export class RoleIndexComponent {

  private userService = inject(RoleService);
  public roles: Role[] = [];

  constructor() { }



  ngOnInit(): void {
    this.init_data();
  }

  onSearch(name: string): void {
    if (name.trim() === '') {
      this.init_data();
      return;
    }

    this.userService.findByName(name).subscribe(
      {
        next: (data) => {
          console.log(data);
          this.roles = [data];
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
  }

  init_data(): void {
    this.userService.getRoles().subscribe(
      {
        next: (data) => {
          console.log(data);
          this.roles = data;
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
  }

  deleteRole(id: string): void {
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
        this.userService.deleteRole(id).subscribe(
          {
            next: () => {
              this.roles = this.roles.filter(role => role.id !== id);
              Swal.fire({
                title: "¡Eliminado!",
                text: "El rol ha sido eliminado con éxito.",
                icon: "success"
              });
              this.init_data();
            },
            error: (error) => {
              console.log(error);
              Swal.fire({
                title: "Error",
                text: "Hubo un problema al eliminar el rol.",
                icon: "error"
              });
            }
          });
      }
    });
  }
}
