import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { PaginatorComponent } from "../../paginator/paginator.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-student-index',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DatePipe, PaginatorComponent],
  templateUrl: './user-index.component.html',
  styleUrl: './user-index.component.css'
})
export class UserIndexComponent {

  public users: User[] = [];
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  page: number | null = 0;
  pagination: any;


  constructor() { }


  ngOnInit(): void {
    // Suscribirse a los cambios del parámetro de ruta 'page'
    this.route.paramMap.subscribe(params => {
      const pageParam = params.get('page');
      this.page = pageParam !== null ? +pageParam : 0;
      if (isNaN(this.page as number)) {
        this.page = 0;
      }
      this.loadUsers(this.page as number);
    });
  }

  private loadUsers(page: number) {
    this.userService.getUsersByPageable(page).subscribe({
      next: (response) => {
        this.users = response.content as User[];
        this.pagination = response;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }


  getUserByDni(dni: string) {
    if (dni.length === 8) {
      this.userService.getUserByDni(dni).subscribe(
        response => {
          this.users = [];
          this.users.push(response);
          this.pagination = null; // ocultar paginador durante búsqueda específica
        }
      );
    } else {
      this.loadUsers(this.page ?? 0);
    }
  }

  verUser(dni: string) {
    sessionStorage.setItem('dni', dni);
    this.router.navigate(['/admin/user/detail']);
  }

  deleteUser(id: string): void {
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
        this.userService.deleteUser(id).subscribe(
          {
            next: () => {
              this.users = this.users.filter(user => user.idUser !== id);
              Swal.fire({
                title: "¡Eliminado!",
                text: "El usuario ha sido eliminado con éxito.",
                icon: "success"
              });
              this.loadUsers(this.page as number);
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
