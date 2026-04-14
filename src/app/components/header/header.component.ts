import { Component, inject } from '@angular/core';
import { SettingService } from '../../services/setting.service';
import { Setting } from '../../models/setting';
import { NgIf } from '@angular/common';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  private settingService = inject(SettingService);
  private authSession = inject(AuthSessionService);

  settings: Setting[] = [];

  constructor() { }

  ngOnInit(): void {
    this.init_data();
  }

  init_data(): void {
    this.settingService.getSettings().subscribe(
      {
        next: (data) => {

          this.settings = data;
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
  }

  get currentUserName(): string {
    const user = this.authSession.currentUser;
    if (!user) {
      return 'Usuario';
    }

    const fullName = `${user.name || ''} ${user.lastname || ''}`.trim();
    return fullName || user.email || 'Usuario';
  }

  get currentUserRole(): string {
    const role = this.authSession.currentUser?.role || '';
    return role || 'SIN ROL';
  }

  get currentUserInitials(): string {
    const user = this.authSession.currentUser;
    if (!user) {
      return 'US';
    }

    const first = (user.name || '').trim().charAt(0);
    const second = (user.lastname || '').trim().charAt(0);
    return `${first}${second}`.toUpperCase() || 'US';
  }

}
