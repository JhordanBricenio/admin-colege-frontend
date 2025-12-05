import { Component, inject } from '@angular/core';
import { EducationLevel } from '../../../models/education-level';
import { EducationLevelService } from '../../../services/education-level.service';
import Swal from 'sweetalert2';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { Management } from '../../../models/management';
import { ManagementService } from '../../../services/management.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-education-level-index',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink],
  templateUrl: './education-level-index.component.html',
  styleUrl: './education-level-index.component.css'
})
export class EducationLevelIndexComponent {

  private educationLevelService = inject(EducationLevelService);
  private managementService = inject(ManagementService);
  public educationLevels: EducationLevel[] = [];
  public managements: Map<string, Management> = new Map();

  constructor() { }



  ngOnInit(): void {
    this.init_data();
  }

  init_data(): void {
    this.managementService.getManagements().subscribe({
      next: (managements) => {
        managements.forEach(m => {
          this.managements.set(m.idManagement!, m);
        });
        this.loadEducationLevels();
      },
      error: (error) => {
        console.log('Error al cargar gestiones:', error);
        this.loadEducationLevels();
      }
    });
  }

  loadEducationLevels(): void {
    this.educationLevelService.getEducationLevels().subscribe({
      next: (data) => {
        console.log(data);
        this.educationLevels = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getManagementName(idManagement: string): string {
    const management = this.managements.get(idManagement);
    return management ? management.name : 'N/A';
  }

  deleteEducationLevel(id: string): void {
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
        this.educationLevelService.deleteEducationLevel(id).subscribe(
          {
            next: () => {
              this.educationLevels = this.educationLevels.filter(level => level.id !== id);
              Swal.fire({
                title: "¡Eliminado!",
                text: "El nivel educativo ha sido eliminado con éxito.",
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
