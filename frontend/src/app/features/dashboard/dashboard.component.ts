import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { TaskStats, Task, TaskStatusType, TaskPriorityType } from '../../core/models/task.interface';
import { UserProfile } from '../../core/models/user.interface';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ChartWidgetComponent, ChartData } from '../../shared/components/chart-widget/chart-widget.component';
import { ExportButtonComponent } from '../../shared/components/export-button/export-button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    StatCardComponent, 
    ChartWidgetComponent, 
    ExportButtonComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: TaskStats | null = null;
  recentTasks: Task[] = [];
  userProfile: UserProfile | null = null;
  loading = false;
  chartsLoading = false;
  showTaskMenu: number | null = null;

  // Chart data
  weeklyProgressData?: ChartData;
  priorityDistributionData?: ChartData;
  
  // Export data
  exportData: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadDashboardData();
    this.setupChartData();
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

  private loadUserProfile(): void {
    this.userProfile = this.authService.getUserProfile();
  }

  private loadDashboardData(): void {
    this.loading = true;

    // Load task statistics
    this.taskService.getMyTaskStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => this.stats = stats,
        error: (error) => console.error('Error loading stats:', error)
      });

    // Load recent tasks
    this.taskService.getMyTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.recentTasks = tasks
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
          this.prepareExportData();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.loading = false;
        }
      });
  }

  private setupChartData(): void {
    this.chartsLoading = true;
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      this.weeklyProgressData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Completed Tasks',
          data: [12, 19, 8, 15, 22, 8, 14],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }, {
          label: 'Created Tasks',
          data: [8, 12, 15, 10, 18, 12, 16],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }]
      };

      this.priorityDistributionData = {
        labels: ['Low', 'Medium', 'High', 'Urgent'],
        datasets: [{
          label: 'Tasks by Priority',
          data: [
            this.getLowPriorityCount(),
            this.getMediumPriorityCount(),
            this.getHighPriorityCount(),
            this.getUrgentPriorityCount()
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(249, 115, 22)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }]
      };

      this.chartsLoading = false;
    }, 1000);
  }

  private prepareExportData(): void {
    this.exportData = this.recentTasks.map(task => ({
      Title: task.title,
      Status: this.getStatusText(task.status),
      Priority: this.getPriorityText(task.priority),
      'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
      Created: new Date(task.createdAt).toLocaleDateString()
    }));
  }

  // Statistics calculation methods
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

  getOverdueCount(): number {
    return this.recentTasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < new Date() && 
      task.status !== 'DONE'
    ).length;
  }

  getLowPriorityCount(): number {
    return this.recentTasks.filter(task => task.priority === 'LOW').length;
  }

  getMediumPriorityCount(): number {
    return this.recentTasks.filter(task => task.priority === 'MEDIUM').length;
  }

  getHighPriorityCount(): number {
    return this.recentTasks.filter(task => task.priority === 'HIGH').length;
  }

  getUrgentPriorityCount(): number {
    return this.recentTasks.filter(task => task.priority === 'URGENT').length;
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

  // Advanced metrics
  getAverageCompletionTime(): string {
    // Mock calculation - in real app, calculate from task completion data
    return '2.5';
  }

  getTasksPerDay(): string {
    // Mock calculation - in real app, calculate from recent activity
    return '3.2';
  }

  getMostProductiveHour(): string {
    // Mock calculation - in real app, analyze task creation/completion times
    return '10 AM';
  }

  // UI helper methods
  getCurrentDate(): string {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getTaskStatusBg(status: TaskStatusType): string {
    const classes = {
      'TODO': 'bg-blue-500',
      'IN_PROGRESS': 'bg-yellow-500',
      'IN_REVIEW': 'bg-purple-500',
      'DONE': 'bg-green-500'
    };
    return classes[status] || 'bg-gray-500';
  }

  getTaskStatusIcon(status: TaskStatusType): string {
    const icons = {
      'TODO': 'pi pi-circle',
      'IN_PROGRESS': 'pi pi-clock',
      'IN_REVIEW': 'pi pi-eye',
      'DONE': 'pi pi-check'
    };
    return icons[status] || 'pi pi-circle';
  }

  getPriorityClasses(priority: TaskPriorityType): string {
    const classes = {
      'LOW': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'MEDIUM': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'HIGH': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'URGENT': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }

  getPriorityText(priority: TaskPriorityType): string {
    const labels = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High',
      'URGENT': 'Urgent'
    };
    return labels[priority] || priority;
  }

  getStatusText(status: TaskStatusType): string {
    const labels = {
      'TODO': 'To Do',
      'IN_PROGRESS': 'In Progress',
      'IN_REVIEW': 'In Review',
      'DONE': 'Completed'
    };
    return labels[status] || status;
  }

  // Action methods
  refreshData(): void {
    this.loadDashboardData();
    this.setupChartData();
  }

  toggleTaskMenu(event: Event, task: Task): void {
    event.stopPropagation();
    this.showTaskMenu = this.showTaskMenu === task.id ? null : task.id;
  }

  openTaskDetail(task: Task): void {
    this.router.navigate(['/tasks', task.id]);
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }
}