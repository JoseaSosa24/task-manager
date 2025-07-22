// Actualizar my-tasks.component.ts para usar modales

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatusType, CreateTaskRequest } from '../../../core/models/task.interface';
import { TaskFormComponent } from '../task-form/task-form.component'; // ← AGREGAR IMPORT

interface KanbanColumn {
  id: TaskStatusType;
  title: string;
  tasks: Task[];
  color: string;
  icon: string;
  bgColor: string;
}

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    RouterModule,
    TaskFormComponent  // ← AGREGAR IMPORT
  ],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit, OnDestroy {
  columns: KanbanColumn[] = [
    {
      id: 'TODO',
      title: 'Por Hacer',
      tasks: [],
      color: '#2196F3',
      bgColor: '#E3F2FD',
      icon: 'radio_button_unchecked'
    },
    {
      id: 'IN_PROGRESS',
      title: 'En Progreso',
      tasks: [],
      color: '#FF9800',
      bgColor: '#FFF3E0',
      icon: 'timelapse'
    },
    {
      id: 'IN_REVIEW',
      title: 'En Revisión',
      tasks: [],
      color: '#9C27B0',
      bgColor: '#F3E5F5',
      icon: 'visibility'
    },
    {
      id: 'DONE',
      title: 'Completadas',
      tasks: [],
      color: '#4CAF50',
      bgColor: '#E8F5E8',
      icon: 'check_circle'
    },
    {
      id: 'CANCELLED',
      title: 'Canceladas',
      tasks: [],
      color: '#F44336',
      bgColor: '#FFEBEE',
      icon: 'cancel'
    }
  ];

  loading = false;
  
  // ========== MODAL STATE ==========
  showTaskForm = false;
  selectedTask: Task | null = null;
  preselectedStatus: TaskStatusType | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== TASK LOADING ==========
  private loadTasks(): void {
    this.loading = true;
    
    this.taskService.getMyTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.distributeTasks(tasks);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.showNotification('Error al cargar las tareas', 'error');
          this.loading = false;
        }
      });
  }

  private distributeTasks(tasks: Task[]): void {
    // Clear existing tasks
    this.columns.forEach(column => column.tasks = []);
    
    // Distribute tasks to columns
    tasks.forEach(task => {
      const column = this.columns.find(col => col.id === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });
  }

  // ========== DRAG & DROP ==========
  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;
    const newStatus = this.getColumnStatus(event.container.element.nativeElement);
    
    if (event.previousContainer === event.container) {
      // Reorder within same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move between columns
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update task status in backend
      if (newStatus && task.status !== newStatus) {
        this.updateTaskStatus(task, newStatus);
      }
    }
  }

  private getColumnStatus(element: HTMLElement): TaskStatusType | null {
    const column = element.closest('[data-status]');
    return column ? column.getAttribute('data-status') as TaskStatusType : null;
  }

  private updateTaskStatus(task: Task, newStatus: TaskStatusType): void {
    this.taskService.updateTaskStatus(task.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTask) => {
          task.status = updatedTask.status;
          this.showNotification(`Tarea movida a ${this.getStatusLabel(newStatus)}`, 'success');
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          this.showNotification('Error al actualizar el estado de la tarea', 'error');
          // Revert the UI change
          this.loadTasks();
        }
      });
  }

  // ========== MODAL ACTIONS ==========
  createNewTask(): void {
    this.selectedTask = null;
    this.preselectedStatus = null;
    this.showTaskForm = true;
  }

  addTaskToColumn(status: TaskStatusType): void {
    this.selectedTask = null;
    this.preselectedStatus = status;
    this.showTaskForm = true;
  }

  editTask(task: Task): void {
    this.selectedTask = { ...task }; // Crear copia para evitar mutaciones
    this.preselectedStatus = null;
    this.showTaskForm = true;
  }

  viewTaskDetails(task: Task): void {
    // Para ver detalles, podrías navegar a una ruta específica
    // o crear otro modal de solo lectura
    this.router.navigate(['/tasks', task.id]);
  }

  duplicateTask(task: Task): void {
    const duplicatedTask: CreateTaskRequest = {
      title: `${task.title} (Copia)`,
      description: task.description,
      priority: task.priority,
      // Convertir null a undefined para que coincida con CreateTaskRequest
      ...(task.dueDate && { dueDate: task.dueDate })
    };

    this.taskService.createTask(duplicatedTask)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadTasks();
          this.showNotification('Tarea duplicada exitosamente', 'success');
        },
        error: (error) => {
          console.error('Error duplicating task:', error);
          this.showNotification('Error al duplicar la tarea', 'error');
        }
      });
  }

  deleteTask(task: Task): void {
    const confirmMessage = `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`;
    
    if (confirm(confirmMessage)) {
      this.taskService.deleteTask(task.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadTasks();
            this.showNotification('Tarea eliminada exitosamente', 'success');
          },
          error: (error) => {
            console.error('Error deleting task:', error);
            this.showNotification('Error al eliminar la tarea', 'error');
          }
        });
    }
  }

  // ========== MODAL EVENTS ==========
  onTaskSaved(task: Task): void {
    this.showTaskForm = false;
    this.selectedTask = null;
    this.preselectedStatus = null;
    this.loadTasks();
    
    const message = this.selectedTask ? 'Tarea actualizada' : 'Tarea creada';
    this.showNotification(`${message} exitosamente`, 'success');
  }

  onTaskFormCancelled(): void {
    this.showTaskForm = false;
    this.selectedTask = null;
    this.preselectedStatus = null;
  }

  // ========== UTILITY METHODS ==========
  refreshBoard(): void {
    this.loadTasks();
    this.showNotification('Tablero actualizado', 'success');
  }

  getConnectedLists(): string[] {
    return this.columns.map(col => `cdk-drop-list-${col.id}`);
  }

  getPriorityClasses(priority: string): string {
    const classes = {
      'LOW': 'priority-low',
      'MEDIUM': 'priority-medium',
      'HIGH': 'priority-high',
      'URGENT': 'priority-urgent'
    };
    return classes[priority as keyof typeof classes] || 'priority-medium';
  }

  getPriorityText(priority: string): string {
    const labels = {
      'LOW': 'Baja',
      'MEDIUM': 'Media',
      'HIGH': 'Alta',
      'URGENT': 'Urgente'
    };
    return labels[priority as keyof typeof labels] || priority;
  }

  getStatusLabel(status: TaskStatusType): string {
    const column = this.columns.find(col => col.id === status);
    return column ? column.title : status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  }

  getDateTooltip(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    
    if (isOverdue) {
      const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return `Vencida hace ${daysDiff} día${daysDiff !== 1 ? 's' : ''}`;
    } else {
      const daysDiff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 0) return 'Vence hoy';
      if (daysDiff === 1) return 'Vence mañana';
      return `Vence en ${daysDiff} días`;
    }
  }

  isOverdue(dateString: string): boolean {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  // ========== STATISTICS ==========
  getTotalTasks(): number {
    return this.columns.reduce((total, column) => total + column.tasks.length, 0);
  }

  getCompletedTasks(): number {
    const completedColumn = this.columns.find(col => col.id === 'DONE');
    return completedColumn ? completedColumn.tasks.length : 0;
  }

  getInProgressTasks(): number {
    const inProgressColumn = this.columns.find(col => col.id === 'IN_PROGRESS');
    return inProgressColumn ? inProgressColumn.tasks.length : 0;
  }

  getCompletionPercentage(): number {
    const totalTasks = this.getTotalTasks();
    if (totalTasks === 0) return 0;
    
    const completedTasks = this.getCompletedTasks();
    return Math.round((completedTasks / totalTasks) * 100);
  }

  // ========== KEYBOARD SHORTCUTS ==========
  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    // Ctrl/Cmd + N = Nueva tarea
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      this.createNewTask();
    }
    
    // Ctrl/Cmd + R = Refrescar tablero
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.refreshBoard();
    }
    
    // F5 = Refrescar tablero
    if (event.key === 'F5') {
      event.preventDefault();
      this.refreshBoard();
    }

    // Escape = Cerrar modal
    if (event.key === 'Escape' && this.showTaskForm) {
      event.preventDefault();
      this.onTaskFormCancelled();
    }
  }

  // ========== HELPERS ==========
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'end' as const,
      verticalPosition: 'top' as const,
      panelClass: [`${type}-snackbar`]
    };

    this.snackBar.open(message, 'Cerrar', config);
  }

  trackByColumn(index: number, column: KanbanColumn): string {
    return column.id;
  }

  trackByTask(index: number, task: Task): number {
    return task.id;
  }
}