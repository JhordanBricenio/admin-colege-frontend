import { Component, inject } from '@angular/core';
import { SettingService } from '../../services/setting.service';
import { Setting } from '../../models/setting';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  private settingService = inject(SettingService);

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

}
