import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { SettingService } from '../../../services/setting.service';
import { Setting } from '../../../models/setting';

@Component({
  selector: 'app-setting-new',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './setting-new.component.html',
  styleUrl: './setting-new.component.css'
})
export class SettingNewComponent {
  form: FormGroup;
  loading = false;
  isEditMode = false;
  idSetting: string | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-()\s]{7,20}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      logo: [''] // URL de logo (simple). Subida de archivo se puede agregar luego.
    });
  }

  ngOnInit(): void {
    // Detectar modo edición via sessionStorage (siguiendo patrón ya usado)
    this.idSetting = this.route.snapshot.paramMap.get('idSetting');
    this.isEditMode = !!this.idSetting;
    if (this.isEditMode && this.idSetting) {
      this.loadSetting(this.idSetting);
    }
  }

  private loadSetting(idSetting: string) {
    console.log('Cargando configuración con ID:', idSetting);
    this.loading = true;
    this.settingsService.getSettingById(idSetting).subscribe({
      next: (data: Setting) => {
        this.form.patchValue({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          logo: data.logo
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar la configuración', 'error');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }

    const payload: Partial<Setting> = this.form.value;
    this.loading = true;

    if (this.isEditMode && this.idSetting) {
      this.settingsService.updateSetting(this.idSetting, payload).subscribe({
        next: () => this.onSuccess('Configuración actualizada correctamente'),
        error: () => this.onError('No se pudo actualizar la configuración')
      });
    } else {
      this.settingsService.createSetting(payload).subscribe({
        next: () => this.onSuccess('Configuración creada correctamente'),
        error: () => this.onError('No se pudo crear la configuración')
      });
    }
  }

  private onSuccess(message: string) {
    this.loading = false;
    Swal.fire('Éxito', message, 'success').then(() => {
      this.router.navigate(['/admin/settings']);
    });
  }

  private onError(message: string) {
    this.loading = false;
    Swal.fire('Error', message, 'error');
  }

  cancel() {
    this.router.navigate(['/admin/settings']);
  }
}
