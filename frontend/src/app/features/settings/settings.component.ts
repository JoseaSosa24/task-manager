import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ThemeService, Theme } from '../../core/services/theme.service';
import { UI_LABELS } from '../../shared/constants/ui-labels.constants';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './settings.component.html',
  styles: [/* aquí van los estilos CSS como los tenías inline */]
})
export class SettingsComponent implements OnInit {
  labels = UI_LABELS;
  currentTheme: Theme = 'light';

  themeControl = new FormControl<Theme>('light');
  notificationsControl = new FormControl(true);
  autoSaveControl = new FormControl(true);
  animationsControl = new FormControl(true);

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.getCurrentTheme();
    this.themeControl.setValue(this.currentTheme);

    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  onThemeChange(): void {
    const selectedTheme = this.themeControl.value;
    if (selectedTheme) {
      this.themeService.setTheme(selectedTheme);
    }
  }
}
