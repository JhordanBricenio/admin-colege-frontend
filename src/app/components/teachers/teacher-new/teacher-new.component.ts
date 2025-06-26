import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-teacher-new',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './teacher-new.component.html',
  styleUrl: './teacher-new.component.css'
})
export class TeacherNewComponent {

  form: FormGroup;
  result: any = null;
  error: string | null = null;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombres: [''],
      apellidoPaterno: [''],
      apellidoMaterno: ['']
    });
  }

  buscar() {
    if (this.form.invalid) {
      return;
    }
    const dni = this.form.get('dni')?.value;
    this.userService.searchByDniApi(dni).subscribe({
      next: (data) => {
        this.form.patchValue({
          nombres: data.nombres,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno
        });
        this.error = null;
      },
      error: () => {
        this.error = 'DNI no encontrado';
        this.form.patchValue({
          nombres: '',
          apellidoPaterno: '',
          apellidoMaterno: ''
        });
      }
    });
  }

}
