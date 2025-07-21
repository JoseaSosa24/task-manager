import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { TaskService } from '../../../core/services/task.service';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '../../../core/models/task.interface';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() taskSaved = new EventEmitter<Task>();
  @Output() cancelled = new EventEmitter<void>();

  taskForm!: FormGroup;
  saving = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.isEditing = !!this.task;
    if (this.task) {
      this.loadTaskData();
    }
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.required],
      priority: ['MEDIUM', Validators.required],
      status: ['TODO'],
      dueDate: [null]
    });
  }

  private loadTaskData(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        status: this.task.status,
        dueDate: this.task.dueDate ? new Date(this.task.dueDate) : null
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.saving = true;

      const formValue = this.taskForm.value;
      const taskData = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        dueDate: formValue.dueDate ? formValue.dueDate.toISOString() : null
      };

      if (this.isEditing && this.task) {
        const updateData: UpdateTaskRequest = {
          ...taskData,
          status: formValue.status
        };

        this.taskService.updateTask(this.task.id, updateData).subscribe({
          next: (updatedTask) => {
            this.saving = false;
            this.taskSaved.emit(updatedTask);
          },
          error: () => {
            this.saving = false;
          }
        });
      } else {
        const createData: CreateTaskRequest = taskData;

        this.taskService.createTask(createData).subscribe({
          next: (newTask) => {
            this.saving = false;
            this.taskSaved.emit(newTask);
          },
          error: () => {
            this.saving = false;
          }
        });
      }
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}