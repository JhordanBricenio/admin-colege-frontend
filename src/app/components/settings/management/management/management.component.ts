import { Component, inject } from '@angular/core';
import { ManagementService } from '../../../../services/management.service';
import { Management } from '../../../../models/management';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [NgFor, DatePipe, RouterLink, RouterModule, CommonModule],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css'
})
export class ManagementComponent {



  private userService = inject(ManagementService);
  public managements: Management[] = [];
  constructor() { }

  ngOnInit(): void {
    this.init_data();
  }

  init_data() {
    this.userService.getManagements().subscribe({
      next: (data) => {
        this.managements = data;
      },
      error: (error) => {
        console.error('Error fetching managements:', error);
      }
    });
  }

  deleteManagement(id: string): void {
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
        this.userService.deleteManagement(id).subscribe(
          {
            next: () => {
              this.managements = this.managements.filter(management => management.idManagement !== id);
              Swal.fire({
                title: "¡Eliminado!",
                text: "La gestión ha sido eliminada con éxito.",
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
