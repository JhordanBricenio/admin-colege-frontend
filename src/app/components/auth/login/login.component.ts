import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthSessionService } from '../../../services/auth-session.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly userService = inject(UserService);
    private readonly authSession = inject(AuthSessionService);
    private readonly router = inject(Router);

    loading = false;
    errorMessage = '';

    form = this.fb.nonNullable.group({
        identifier: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(4)]]
    });

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.userService.login(this.form.getRawValue()).subscribe({
            next: (response) => {
                this.authSession.setSessionFromAuthResponse(response);
                const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
                this.router.navigateByUrl(returnUrl || '/admin');
            },
            error: () => {
                this.loading = false;
                this.errorMessage = 'Credenciales inválidas o sesión no autorizada.';
            },
            complete: () => {
                this.loading = false;
            }
        });
    }
}
