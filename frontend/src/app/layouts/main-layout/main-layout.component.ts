// frontend/src/app/layouts/main-layout/main-layout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/user.interface';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterModule,
    MatSidenavModule, 
    MatToolbarModule, 
    MatButtonModule,
    MatIconModule, 
    MatListModule, 
    MatMenuModule, 
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  private destroy$ = new Subject<void>();
  sidebarCollapsed = false; // Para controlar el estado del sidebar

  isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userProfile = user ? this.authService.getUserProfile() : null;
      });
  }

  logout(): void {
    this.authService.logout();
  }

  // Método para toggle del sidebar
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Método para obtener las iniciales del usuario
  getUserInitials(): string {
    if (!this.userProfile) return 'U';
    
    if (this.userProfile.initials) {
      return this.userProfile.initials;
    }
    
    if (this.userProfile.firstName && this.userProfile.lastName) {
      return `${this.userProfile.firstName.charAt(0)}${this.userProfile.lastName.charAt(0)}`;
    }
    
    if (this.userProfile.firstName) {
      return this.userProfile.firstName.charAt(0);
    }
    
    return 'U';
  }

  // Método para obtener el nombre completo del usuario
  getUserFullName(): string {
    if (!this.userProfile) return 'Usuario';
    
    if (this.userProfile.fullName) {
      return this.userProfile.fullName;
    }
    
    if (this.userProfile.firstName && this.userProfile.lastName) {
      return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    }
    
    return this.userProfile.firstName || 'Usuario';
  }

  // Método para obtener el email del usuario
  getUserEmail(): string {
    return this.userProfile?.email || 'user@email.com';
  }

  // Método para obtener el primer nombre del usuario
  getFirstName(): string {
    return this.userProfile?.firstName || 'Usuario';
  }
}