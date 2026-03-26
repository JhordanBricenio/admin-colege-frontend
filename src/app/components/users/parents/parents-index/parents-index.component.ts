import { Component, inject } from '@angular/core';
import { PaginatorComponent } from '../../../paginator/paginator.component';
import { NgFor, NgIf } from '@angular/common';
import { Parent } from '../../../../models/parent';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ParentService } from '../../../../services/parent.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-parents-index',
  standalone: true,
  imports: [NgIf, NgFor, PaginatorComponent, RouterLink],
  templateUrl: './parents-index.component.html',
  styleUrl: './parents-index.component.css'
})
export class ParentsIndexComponent {

  public users: Parent[] = [];
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private parentService = inject(ParentService);
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
    this.parentService.getUsersByPageable(page).subscribe({
      next: (response) => {
        console.log('Fetched users:', response);
        this.users = response.content as Parent[];
        this.pagination = response;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }


  getUserByDni(dni: string) {
    if (dni.length === 8) {
      this.parentService.getUserByDni(dni).subscribe(
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
    this.router.navigate(['/admin/parent/detail']);
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
        this.parentService.deleteUser(id).subscribe(
          {
            next: () => {
              this.users = this.users.filter(user => user.idParent !== id);
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
                text: "Hubo un problema al eliminar el estudiante.",
                icon: "error"
              });
            }
          });
      }
    });
  }

}
