import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { UserProfile } from '../../core/models/user.interface';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterModule,
    MatMenuModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  sidebarCollapsed = false;
  showMobileNav = true;
  showMobileSidebar = false;
  totalTasks = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadTaskCount();
    this.detectMobile();
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

  private loadTaskCount(): void {
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.totalTasks = tasks.length;
      });
  }

  private detectMobile(): void {
    const checkMobile = () => {
      this.showMobileNav = window.innerWidth < 768;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
  }

  // Sidebar controls
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.showMobileSidebar = !this.showMobileSidebar;
  }

  closeMobileSidebar(): void {
    this.showMobileSidebar = false;
  }

  // User profile helpers
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

  getUserFullName(): string {
    if (!this.userProfile) return 'User';
    
    if (this.userProfile.fullName) {
      return this.userProfile.fullName;
    }
    
    if (this.userProfile.firstName && this.userProfile.lastName) {
      return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    }
    
    return this.userProfile.firstName || 'User';
  }

  getUserEmail(): string {
    return this.userProfile?.email || 'user@email.com';
  }

  getFirstName(): string {
    return this.userProfile?.firstName || 'User';
  }

  getTotalTasks(): number {
    return this.totalTasks;
  }

  // Actions
  logout(): void {
    this.authService.logout();
  }
}