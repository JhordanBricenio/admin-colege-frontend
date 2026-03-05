import { Component, inject } from '@angular/core';
import { Teacher } from '../../../../models/teacher';
import { TeacherService } from '../../../../services/teacher.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { NgFor, NgIf } from '@angular/common';
import { PaginatorComponent } from '../../../paginator/paginator.component';

@Component({
  selector: 'app-teacher-index',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, PaginatorComponent],
  templateUrl: './teacher-index.component.html',
  styleUrl: './teacher-index.component.css'
})
export class TeacherIndexComponent {

  public users: Teacher[] = [];
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private teacherService = inject(TeacherService);
  page: number | null = 0;
  pagination: any;


  constructor() { }


  ngOnInit(): void {
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
    this.teacherService.getUsersByPageable(page).subscribe({
      next: (response) => {
        this.users = response.content as Teacher[];
        this.pagination = response;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }


  getUserByDni(dni: string) {
    if (dni.length === 8) {
      this.teacherService.getUserByDni(dni).subscribe(
        response => {
          this.users = [];
          this.users.push(response);
          this.pagination = null;
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
        this.teacherService.deleteUser(id).subscribe(
          {
            next: () => {
              this.users = this.users.filter(user => user.idTeacher !== id);
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
                text: "Hubo un problema al eliminar el profesor.",
                icon: "error"
              });
            }
          });
      }
    });
  }


}
