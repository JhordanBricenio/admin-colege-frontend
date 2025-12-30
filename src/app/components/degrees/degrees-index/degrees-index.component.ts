import { Component, inject } from '@angular/core';
import { DegreeService } from '../../../services/degree.service';
import { NgFor, NgIf } from '@angular/common';
import { Degree } from '../../../models/degree';
import { Course } from '../../../models/course';
import { RouterLink } from '@angular/router';
import { EducationLevel } from '../../../models/education-level';
import { EducationLevelService } from '../../../services/education-level.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-degrees-index',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './degrees-index.component.html',
  styleUrl: './degrees-index.component.css'
})
export class DegreesIndexComponent {

  public degrees: Degree[] = [];
  showCursos = false;
  selectedDegreeId: number | null = null;
  courses: Course[] = [];
  private educationLevelService = inject(EducationLevelService);
  educationLevelsMap: Map<string, EducationLevel> = new Map();

  constructor() { }

  private degreeService = inject(DegreeService);


  ngOnInit(): void {
    this.loadDegrees();
  }

  private loadDegrees(): void {
    this.degreeService.getDegrees().subscribe((data) => {
      this.degrees = data;
      this.loadEducationLevels();
    });
  }

  private loadEducationLevels(): void {
    this.educationLevelService.getEducationLevels().subscribe({
      next: (levels) => {
        this.educationLevelsMap = new Map(
          levels
            .filter(l => !!l.idEducationLevel)
            .map(level => [String(level.idEducationLevel), level])
        );
      },
      error: (error) => {
        console.log('Error al cargar niveles educativos', error);
      }
    });
  }

  getEducationLevelName(idEducationLevel: string | number): string {
    const level = this.educationLevelsMap.get(String(idEducationLevel));
    return level ? level.name : 'N/A';
  }

  getEducationLevelShift(idEducationLevel: string | number): string {
    const level = this.educationLevelsMap.get(String(idEducationLevel));
    return level ? level.shift : 'N/A';
  }

  deleteDegree(id: string): void {
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
        this.degreeService.deleteDegree(id).subscribe(
          {
            next: () => {
              this.degrees = this.degrees.filter(degree => degree.idDegree !== id);
              Swal.fire({
                title: "¡Eliminado!",
                text: "El grado ha sido eliminado con éxito.",
                icon: "success"
              });
              this.loadDegrees();
            },
            error: (error) => {
              console.log(error);
              Swal.fire({
                title: "Error",
                text: "Hubo un problema al eliminar el grado.",
                icon: "error"
              });
            }
          });
      }
    });
  }
}
