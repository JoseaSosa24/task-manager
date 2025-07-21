// frontend/src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { TaskStats, Task, TaskStatusType, TaskPriorityType } from '../../core/models/task.interface';
import { UserProfile } from '../../core/models/user.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: TaskStats | null = null;
  recentTasks: Task[] = [];
  userProfile: UserProfile | null = null;
  loading = false;
  showTaskMenu: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadDashboardData();
    this.addClickOutsideListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeClickOutsideListener();
  }

  private addClickOutsideListener(): void {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  private removeClickOutsideListener(): void {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.task-menu-container')) {
      this.showTaskMenu = null;
    }
  }

  toggleTaskMenu(event: Event, task: Task): void {
    event.stopPropagation();
    this.showTaskMenu = this.showTaskMenu === task.id ? null : task.id;
  }

  private loadUserProfile(): void {
    this.userProfile = this.authService.getUserProfile();
  }

  private loadDashboardData(): void {
    this.loading = true;

    this.taskService.getMyTaskStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => this.stats = stats,
        error: (error) => console.error('Error loading stats:', error)
      });

    this.taskService.getMyTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.recentTasks = tasks
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.loading = false;
        }
      });
  }

  // Métodos de cálculo de porcentajes basados en tareas reales
  getTotalTasks(): number {
    return this.recentTasks.length;
  }

  getCompletedCount(): number {
    return this.recentTasks.filter(task => task.status === 'DONE').length;
  }

  getInProgressCount(): number {
    return this.recentTasks.filter(task => task.status === 'IN_PROGRESS').length;
  }

  getPendingCount(): number {
    return this.recentTasks.filter(task => task.status === 'TODO').length;
  }

  getCompletionPercentage(): number {
    const total = this.getTotalTasks();
    const completed = this.getCompletedCount();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getInProgressPercentage(): number {
    const total = this.getTotalTasks();
    const inProgress = this.getInProgressCount();
    return total > 0 ? Math.round((inProgress / total) * 100) : 0;
  }

  getNotStartedPercentage(): number {
    const total = this.getTotalTasks();
    const pending = this.getPendingCount();
    return total > 0 ? Math.round((pending / total) * 100) : 0;
  }

  // Métodos de filtrado de tareas
  getCompletedTasks(): Task[] {
    return this.recentTasks.filter(task => task.status === 'DONE');
  }

  getUrgentTasks(): Task[] {
    return this.recentTasks.filter(task => 
      task.priority === 'URGENT' && 
      task.status !== 'DONE' && 
      task.status !== 'CANCELLED'
    );
  }

  // Métodos de utilidad para UI
  getPriorityClasses(priority: TaskPriorityType): string {
    const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    const colors = {
      'URGENT': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'HIGH': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'LOW': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    return `${base} ${colors[priority] || 'bg-gray-100 text-gray-800'}`;
  }

  getStatusClasses(status: TaskStatusType): string {
    const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    const colors = {
      'TODO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'IN_REVIEW': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'DONE': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return `${base} ${colors[status] || 'bg-gray-100 text-gray-800'}`;
  }

  getStatusText(status: TaskStatusType): string {
    const labels = {
      'TODO': 'Por Hacer',
      'IN_PROGRESS': 'En Progreso', 
      'IN_REVIEW': 'En Revisión',
      'DONE': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  }

  getPriorityText(priority: TaskPriorityType): string {
    const labels = {
      'LOW': 'Baja',
      'MEDIUM': 'Media',
      'HIGH': 'Alta', 
      'URGENT': 'Urgente'
    };
    return labels[priority] || priority;
  }

  // Métodos de verificación de estado
  isCompleted(task: Task): boolean {
    return task.status === 'DONE';
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  }

  // Métodos de acción
  logout(): void {
    this.authService.logout();
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  // Método de utilidad para fechas
  getCurrentDate(): string {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${days[now.getDay()]} ${day}/${month}/${year}`;
  }
}