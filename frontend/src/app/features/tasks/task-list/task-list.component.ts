import { Component, OnInit, OnDestroy } from '@angular/core';
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





import { Task, TaskPriority, TaskStatus } from '../../../core/models/task.interface';
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
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  showTaskForm = false;
  selectedTask: Task | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;
        this.filteredTasks = tasks;
      });

    this.taskService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);
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

  onFiltersChanged(filters: any): void {
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
        next: () => {
          this.snackBar.open('Tarea eliminada', 'Cerrar', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error al eliminar la tarea', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  changeStatus(task: Task, newStatus: TaskStatus): void {
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
    this.snackBar.open(
      this.selectedTask ? 'Tarea actualizada' : 'Tarea creada', 
      'Cerrar', 
      { duration: 3000 }
    );
  }

  onTaskFormCancelled(): void {
    this.showTaskForm = false;
    this.selectedTask = null;
  }

  isOverdue(task: Task): boolean {
    return task.dueDate 
      ? new Date(task.dueDate) < new Date() && task.status !== 'DONE'
      : false;
  }

  getStatusLabel(status: TaskStatus): string {
    const labels = {
      'TODO': 'Por Hacer',
      'IN_PROGRESS': 'En Progreso',
      'IN_REVIEW': 'En Revisión',
      'DONE': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: TaskPriority): string {
    const labels = {
      'LOW': 'Baja',
      'MEDIUM': 'Media',
      'HIGH': 'Alta',
      'URGENT': 'Urgente'
    };
    return labels[priority] || priority;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}