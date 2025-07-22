import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Task, TaskPriority, TaskStatus, TaskFilter, TaskStatusType } from '../../../core/models/task.interface';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskFiltersComponent } from '../task-filters/task-filters.component';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressBarModule,
    TaskFormComponent,
    TaskFiltersComponent
  ],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit, OnDestroy, AfterViewInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  showTaskForm = false;
  selectedTask: Task | null = null;
  private lastAppliedFilter: TaskFilter = {};

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadTasks();

    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
      });

    this.taskService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);
  }

  ngAfterViewInit(): void {
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.lastAppliedFilter && Object.keys(this.lastAppliedFilter).length > 0) {
          this.onFiltersChanged(this.lastAppliedFilter);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.taskService.getMyTasks().subscribe({
      error: (error) => {
        this.snackBar.open('Error al cargar las tareas', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onFiltersChanged(filters: TaskFilter): void {
    this.lastAppliedFilter = filters;
    
    this.taskService.filterTasks(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(filteredTasks => {
        this.filteredTasks = filteredTasks;
      });
  }

  openTaskForm(): void {
    this.selectedTask = null;
    this.showTaskForm = true;
  }

  editTask(task: Task): void {
    this.selectedTask = task;
    this.showTaskForm = true;
  }

  deleteTask(taskId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: (response) => {
          console.log('Delete response:', response);
          this.snackBar.open('Tarea eliminada', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.snackBar.open('Error al eliminar la tarea', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  changeStatus(task: Task, newStatus: TaskStatusType): void {
    this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
      next: () => {
        this.snackBar.open('Estado actualizado', 'Cerrar', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Error al actualizar el estado', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onTaskSaved(task: Task): void {
    this.showTaskForm = false;
    this.selectedTask = null;
    
    this.taskService.getMyTasks().subscribe({
      next: () => {
        this.snackBar.open(
          this.selectedTask ? 'Tarea actualizada' : 'Tarea creada',
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Error al actualizar la lista', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onTaskFormCancelled(): void {
    this.showTaskForm = false;
    this.selectedTask = null;
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }

  isOverdue(task: Task): boolean {
    return task.dueDate
      ? new Date(task.dueDate) < new Date() && task.status !== 'DONE'
      : false;
  }

  getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      'TODO': 'Por Hacer',
      'IN_PROGRESS': 'En Progreso',
      'IN_REVIEW': 'En Revisión',
      'DONE': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: TaskPriority): string {
    const labels: Record<TaskPriority, string> = {
      'LOW': 'Baja',
      'MEDIUM': 'Media',
      'HIGH': 'Alta',
      'URGENT': 'Urgente'
    };
    return labels[priority] || priority;
  }

  getStatusClasses(status: TaskStatus): string {
    const classes: Record<TaskStatus, string> = {
      'TODO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'IN_REVIEW': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'DONE': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return classes[status] || '';
  }

  getPriorityClasses(priority: TaskPriority): string {
    const classes: Record<TaskPriority, string> = {
      'LOW': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'HIGH': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'URGENT': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return classes[priority] || '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}