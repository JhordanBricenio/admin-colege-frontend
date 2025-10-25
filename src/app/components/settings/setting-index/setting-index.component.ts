import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Setting } from '../../../models/setting';
import { SettingService } from '../../../services/setting.service';

@Component({
  selector: 'app-setting-index',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './setting-index.component.html',
  styleUrl: './setting-index.component.css'
})
export class SettingIndexComponent {


  private settingService = inject(SettingService);

  public settings: Setting[] = [];

  ngOnInit(): void {
    this.init_data();
  }

  init_data(): void {
    this.settingService.getSettings().subscribe(
      {
        next: (data) => {

          this.settings = data;
          console.log(this.settings);
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
  }

}
