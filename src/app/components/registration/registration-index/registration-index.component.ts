import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegistrationService } from '../../../services/registration.service';
import Swal from 'sweetalert2';
import { RegistrationDTO } from '../../../models/registrationDTO';
import { PaginatorComponent } from '../../paginator/paginator.component';



@Component({
  selector: 'app-registration-index',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, RouterModule, FormsModule, DatePipe, PaginatorComponent],
  templateUrl: './registration-index.component.html',
  styleUrl: './registration-index.component.css'
})
export class RegistrationIndexComponent implements OnInit {


  private registrationService = inject(RegistrationService);
  private route = inject(ActivatedRoute);

  registrations: RegistrationDTO[] = [];
  filteredRegistrations: RegistrationDTO[] = [];
  searchTerm: string = '';
  filterStatus: string = 'ALL';
  page: number | null = 0;
  pagination: any;
  isLoading = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const pageParam = params.get('page');
      this.page = pageParam !== null ? +pageParam : 0;
      if (isNaN(this.page as number)) {
        this.page = 0;
      }
      this.loadRegistrations(this.page as number);
    });
  }

  loadRegistrations(page: number): void {
    this.isLoading = true;
    this.registrationService.getRegistrationsByPageable(page).subscribe({
      next: (data) => {

        this.registrations = data.content as RegistrationDTO[];
        this.pagination = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading registrations:', error);
        Swal.fire('Error', 'No se pudieron cargar las matrículas', 'error');
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.registrations;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(reg => {
        const studentName = this.normalizeText(reg.studentFullName);
        const parentName = this.normalizeText(reg.parentFullName);
        const degree = this.normalizeText(reg.degreeCourse);
        const studentCode = this.normalizeText(reg.studentCode);
        return (
          studentName.includes(term) ||
          parentName.includes(term) ||
          degree.includes(term) ||
          studentCode.includes(term)
        );
      });
    }

    if (this.filterStatus !== 'ALL') {
      const isActive = this.filterStatus === 'ACTIVE';
      filtered = filtered.filter(reg => reg.status === isActive);
    }

    this.filteredRegistrations = filtered;
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '').toLowerCase();
  }

  toggleRegistrationStatus(registration: RegistrationDTO): void {
    const nextStatus = !registration.status;
    const actionText = nextStatus ? 'activar' : 'inactivar';

    Swal.fire({
      title: `¿Deseas ${actionText} esta matrícula?`,
      text: nextStatus
        ? 'La matrícula volverá a estar disponible como activa.'
        : 'La matrícula quedará inactiva (baja lógica).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: nextStatus ? '#198754' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${actionText}`
    }).then((result) => {
      if (result.isConfirmed) {
        const body = {
          status: nextStatus,
          idStudent: registration.studentId,
          idParent: registration.parentId
        } as any;

        console.log('Updating registration with data:', body);

        this.registrationService.updateRegistration(registration.idRegistration, body).subscribe({
          next: () => {
            Swal.fire(
              'Actualizado',
              `La matrícula ahora está ${nextStatus ? 'activa' : 'inactiva'}.`,
              'success'
            );
            this.loadRegistrations(this.page as number);
          },
          error: (error) => {
            console.error('Error updating registration status:', error);
            Swal.fire('Error', 'No se pudo actualizar el estado de la matrícula', 'error');
          }
        });
      }
    });
  }

  getInitials(fullName: string): string {
    const normalized = String(fullName ?? '').trim();
    if (!normalized) {
      return 'NA';
    }

    const parts = normalized.split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return `${first}${last}`.toUpperCase();
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
  }

  getStatusText(status: string): string {
    return status === 'ACTIVE' ? 'Activo' : 'Inactivo';
  }
}
