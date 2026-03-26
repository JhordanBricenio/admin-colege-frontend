import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Registration } from '../../../models/registration';
import { RegistrationService } from '../../../services/registration.service';
import { RegistrationDTO } from '../../../models/registrationDTO';

@Component({
  selector: 'app-registration-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registration-detail.component.html',
  styleUrl: './registration-detail.component.css'
})
export class RegistrationDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private registrationService = inject(RegistrationService);

  registration: RegistrationDTO | null = null;
  isLoading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.isLoading = false;
      Swal.fire('Error', 'No se encontró el identificador de matrícula', 'error').then(() => {
        this.backToList();
      });
      return;
    }

    this.loadRegistration(id);
  }

  loadRegistration(id: string): void {
    this.isLoading = true;
    this.registrationService.getRegistrationByDetail(id).subscribe({
      next: (response) => {
        this.registration = response as RegistrationDTO;

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading registration detail:', error);
        Swal.fire('Error', 'No se pudo cargar el detalle de la matrícula', 'error').then(() => {
          this.backToList();
        });
      }
    });
  }

  backToList(): void {
    this.router.navigate(['/admin/registration']);
  }

  getStatusText(): string {
    return this.registration?.status ? 'Activa' : 'Inactiva';
  }

  getStatusClass(): string {
    return this.registration?.status ? 'status-active' : 'status-inactive';
  }

  getStudentInitials(): string {
    console.log('Calculating student initials for registration:', this.registration);
    const name = this.registration.studentFullName ?? '';
    const lastname = this.registration.studentFullName ?? '';
    const nameParts = name.split(' ');
    const lastnameParts = lastname.split(' ');
    const initials = `${nameParts[0].charAt(0)}${lastnameParts[0].charAt(0)}`.toUpperCase();
    console.log('Calculated student initials:', initials);
    return initials || 'AL';
  }

  getParentInitials(): string {
    const name = this.registration.parentFullName ?? '';
    const lastname = this.registration.parentFullName ?? '';
    console.log(this.registration.parentFullName)
    const nameParts = name.split(' ');
    const lastnameParts = lastname.split(' ');
    const initials = `${nameParts[0].charAt(0)}${lastnameParts[0].charAt(0)}`.toUpperCase();
    console.log('Calculated parent initials:', initials);
    return initials || 'AP';
  }

}
