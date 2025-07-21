// frontend/src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from './core/services/auth.service';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MainLayoutComponent
  ],
  template: `
    <div class="app-container">
      <app-main-layout *ngIf="showMainLayout">
        <router-outlet></router-outlet>
      </app-main-layout>
      
      <router-outlet *ngIf="!showMainLayout"></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      width: 100%;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'task-manager-frontend';
  showMainLayout = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Escuchar cambios de ruta para mostrar/ocultar layout
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showMainLayout = !event.url.includes('/auth');
      });

    // Verificar estado inicial
    this.showMainLayout = !this.router.url.includes('/auth');
  }
}