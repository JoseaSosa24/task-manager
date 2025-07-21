import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus } from '../../../core/models/task.interface';
import { UI_LABELS } from '../../../shared/constants/ui-labels.constants';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styles: [ /* estilos que ya tienes en línea */ ],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule
  ]
})
export class TaskDetailComponent implements OnInit {
  labels = UI_LABELS;
  task: Task | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const taskId = +this.route.snapshot.params['id'];
    this.loadTask(taskId);
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: task => this.task = task,
      error: () => {
        this.snackBar.open('Error al cargar la tarea', this.labels.CLOSE, {
          duration: 3000, panelClass: ['error-snackbar']
        });
        this.goBack();
      }
    });
  }

  changeStatus(newStatus: TaskStatus): void {
    if (!this.task) return;
    this.taskService.updateTaskStatus(this.task.id, newStatus).subscribe({
      next: updated => {
        this.task = updated;
        this.snackBar.open('Estado actualizado exitosamente', this.labels.CLOSE, {
          duration: 3000, panelClass: ['success-snackbar']
        });
      }
    });
  }

  deleteTask(): void {
    if (this.task && confirm(this.labels.DELETE_TASK_CONFIRM)) {
      this.taskService.deleteTask(this.task.id).subscribe(() => {
        this.snackBar.open(this.labels.TASK_DELETED, this.labels.CLOSE, {
          duration: 3000, panelClass: ['success-snackbar']
        });
        this.goBack();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  getStatusLabel(status: TaskStatus): string {
    return {
      'TODO': this.labels.TODO,
      'IN_PROGRESS': this.labels.IN_PROGRESS,
      'DONE': this.labels.DONE
    }[status] || status;
  }

  getPriorityLabel(priority: string): string {
    return {
      'LOW': this.labels.LOW,
      'MEDIUM': this.labels.MEDIUM,
      'HIGH': this.labels.HIGH
    }[priority] || priority;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
