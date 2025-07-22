import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatusType } from '../../../core/models/task.interface';

interface KanbanColumn {
  id: TaskStatusType;
  title: string;
  tasks: Task[];
  color: string;
  icon: string;
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <div class="kanban-container p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gradient">Kanban Board</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            Drag and drop tasks to update their status
          </p>
        </div>
        <button class="btn-glass" (click)="refreshBoard()">
          <i class="pi pi-refresh mr-2"></i>
          Refresh Board
        </button>
      </div>

      <!-- Kanban Columns -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
        <div *ngFor="let column of columns; trackBy: trackByColumn" 
             class="kanban-column"
             [attr.data-status]="column.id">
          
          <!-- Column Header -->
          <div class="flex items-center justify-between mb-4 p-4 rounded-xl"
               [ngClass]="'bg-' + column.color + '-100 dark:bg-' + column.color + '-900/20'">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                   [ngClass]="'bg-' + column.color + '-500'">
                <i [class]="column.icon" class="text-white text-sm"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ column.title }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ column.tasks.length }} tasks
                </p>
              </div>
            </div>
            
            <button class="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <i class="pi pi-plus text-gray-600 dark:text-gray-300"></i>
            </button>
          </div>

          <!-- Tasks Container -->
          <div class="space-y-3 min-h-[400px]"
               cdkDropList
               [cdkDropListData]="column.tasks"
               [cdkDropListConnectedTo]="getConnectedLists()"
               (cdkDropListDropped)="onTaskDrop($event)">
            
            <!-- Task Cards -->
            <div *ngFor="let task of column.tasks; trackBy: trackByTask"
                 class="kanban-task group"
                 cdkDrag
                 [cdkDragData]="task">
              
              <!-- Drag Handle -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {{ task.title }}
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {{ task.description }}
                  </p>
                </div>
                
                <button class="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
                        [matMenuTriggerFor]="taskMenu">
                  <i class="pi pi-ellipsis-v text-gray-400"></i>
                </button>
                
                <mat-menu #taskMenu="matMenu">
                  <button mat-menu-item (click)="editTask(task)">
                    <i class="pi pi-pencil mr-2"></i>
                    Edit Task
                  </button>
                  <button mat-menu-item (click)="deleteTask(task)">
                    <i class="pi pi-trash mr-2"></i>
                    Delete Task
                  </button>
                </mat-menu>
              </div>

              <!-- Task Meta -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="getPriorityClasses(task.priority)">
                    {{ getPriorityText(task.priority) }}
                  </span>
                  
                  <span *ngIf="task.dueDate" 
                        class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <i class="pi pi-calendar mr-1"></i>
                    {{ formatDate(task.dueDate) }}
                  </span>
                </div>
                
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span class="text-xs text-white font-semibold">
                    {{ getTaskInitials(task) }}
                  </span>
                </div>
              </div>

              <!-- Drag Preview -->
              <div *cdkDragPreview class="kanban-task dragging shadow-2xl transform rotate-3">
                <h4 class="font-semibold text-gray-900 mb-1">{{ task.title }}</h4>
                <p class="text-sm text-gray-600">{{ task.description }}</p>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="column.tasks.length === 0" 
                 class="flex flex-col items-center justify-center py-12 text-center">
              <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <i [class]="column.icon" class="text-2xl text-gray-400"></i>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                No {{ column.title.toLowerCase() }} tasks
              </p>
              <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Drag tasks here or create new ones
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="loading" 
           class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="glass-card p-8 text-center">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-900 dark:text-white font-medium">Updating tasks...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .kanban-column {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 16px;
      padding: 16px;
    }

    .kanban-task {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 16px;
      cursor: move;
      transition: all 0.3s ease;
    }

    .kanban-task:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .kanban-task.dragging {
      transform: rotate(5deg);
      opacity: 0.8;
      z-index: 1000;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .kanban-task:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drag-placeholder {
      opacity: 0.4;
      background: rgba(0, 0, 0, 0.1);
      border: 2px dashed rgba(0, 0, 0, 0.2);
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  columns: KanbanColumn[] = [
    {
      id: 'TODO',
      title: 'To Do',
      tasks: [],
      color: 'blue',
      icon: 'pi pi-circle'
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      tasks: [],
      color: 'yellow',
      icon: 'pi pi-clock'
    },
    {
      id: 'IN_REVIEW',
      title: 'In Review',
      tasks: [],
      color: 'purple',
      icon: 'pi pi-eye'
    },
    {
      id: 'DONE',
      title: 'Completed',
      tasks: [],
      color: 'green',
      icon: 'pi pi-check'
    }
  ];

  loading = false;
  private destroy$ = new Subject<void>();

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
      
      // Update task status
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
    this.loading = true;
    
    this.taskService.updateTaskStatus(task.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTask) => {
          task.status = updatedTask.status;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          // Revert the UI change
          this.loadTasks();
        }
      });
  }

  getConnectedLists(): string[] {
    return this.columns.map((_, index) => `cdk-drop-list-${index}`);
  }

  refreshBoard(): void {
    this.loadTasks();
  }

  editTask(task: Task): void {
    // Implement edit functionality
    console.log('Edit task:', task);
  }

  deleteTask(task: Task): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(task.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadTasks();
          },
          error: (error) => {
            console.error('Error deleting task:', error);
          }
        });
    }
  }

  getPriorityClasses(priority: string): string {
    const classes = {
      'LOW': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'MEDIUM': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'HIGH': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'URGENT': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return classes[priority as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getPriorityText(priority: string): string {
    const labels = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High',
      'URGENT': 'Urgent'
    };
    return labels[priority as keyof typeof labels] || priority;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getTaskInitials(task: Task): string {
    return task.title.charAt(0).toUpperCase();
  }

  trackByColumn(index: number, column: KanbanColumn): string {
    return column.id;
  }

  trackByTask(index: number, task: Task): number {
    return task.id;
  }
}