import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent implements OnInit {
  private authSession = inject(AuthSessionService);
  private router = inject(Router);

  ngOnInit(): void {
    this.authSession.clearSession();
    this.router.navigate(['/login']);
  }

}
