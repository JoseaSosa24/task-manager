import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TaskFilter, TaskStatus, TaskPriority } from '../../../core/models/task.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-task-filters',
  standalone: true,
   imports: [
    CommonModule,            
    ReactiveFormsModule,     
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './task-filters.component.html'
})
export class TaskFiltersComponent {
  @Input() loading = false;
  @Output() filtersChanged = new EventEmitter<TaskFilter>();

  filtersForm: FormGroup;
  selectedStatuses: TaskStatus[] = [];
  selectedPriorities: TaskPriority[] = [];

  constructor(private fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      search: [''],
      status: [[]],
      priority: [[]]
    });
    this.setupFilterWatchers();
  }

  private setupFilterWatchers(): void {
    this.filtersForm.get('search')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.emitFilters());

    this.filtersForm.get('status')?.valueChanges
      .subscribe(values => {
        this.selectedStatuses = values || [];
        this.emitFilters();
      });

    this.filtersForm.get('priority')?.valueChanges
      .subscribe(values => {
        this.selectedPriorities = values || [];
        this.emitFilters();
      });
  }

  private emitFilters(): void {
    const { search, status, priority } = this.filtersForm.value;
    this.filtersChanged.emit({
      search: search?.trim() || undefined,
      status: status?.length ? status : undefined,
      priority: priority?.length ? priority : undefined
    });
  }

  clearFilters(): void {
    this.filtersForm.reset({ search: '', status: [], priority: [] });
    this.selectedStatuses = [];
    this.selectedPriorities = [];
    this.emitFilters();
  }

  hasActiveFilters(): boolean {
    const { search } = this.filtersForm.value;
    return !!search?.trim() || this.selectedStatuses.length > 0 || this.selectedPriorities.length > 0;
  }

  removeStatusFilter(status: TaskStatus): void {
    const newStatuses = (this.filtersForm.value.status as TaskStatus[])
      .filter(s => s !== status);
    this.filtersForm.patchValue({ status: newStatuses });
  }

  removePriorityFilter(priority: TaskPriority): void {
    const newPriorities = (this.filtersForm.value.priority as TaskPriority[])
      .filter(p => p !== priority);
    this.filtersForm.patchValue({ priority: newPriorities });
  }

  getStatusLabel(status: TaskStatus): string {
    const map = { 'TODO': 'Por Hacer', 'IN_PROGRESS': 'En Progreso', 'IN_REVIEW': 'En Revisión', 'DONE': 'Completada'};
    return map[status] ?? status;
  }

  getPriorityLabel(priority: TaskPriority): string {
    const map = { 'LOW': 'Baja', 'MEDIUM': 'Media', 'HIGH': 'Alta', 'URGENT': 'Urgente' };
    return map[priority] ?? priority;
  }
}
