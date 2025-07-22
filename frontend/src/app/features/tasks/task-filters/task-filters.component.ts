import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { TaskFilter, TaskPriorityType, TaskStatusType } from '../../../core/models/task.interface';


@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MultiSelectModule,
    ButtonModule
  ],
  templateUrl: './task-filters.component.html',
})
export class TaskFiltersComponent implements OnInit {
  @Input() loading = false;  
  @Output() filtersChanged = new EventEmitter<TaskFilter>();

  filtersForm!: FormGroup;

  statusOptions = [
    { label: 'Por Hacer', value: 'TODO' as TaskStatusType },
    { label: 'En Progreso', value: 'IN_PROGRESS' as TaskStatusType },
    { label: 'En Revisión', value: 'IN_REVIEW' as TaskStatusType },
    { label: 'Completada', value: 'DONE' as TaskStatusType },
    { label: 'Cancelada', value: 'CANCELLED' as TaskStatusType }
  ];

  priorityOptions = [
    { label: 'Baja', value: 'LOW' as TaskPriorityType },
    { label: 'Media', value: 'MEDIUM' as TaskPriorityType },
    { label: 'Alta', value: 'HIGH' as TaskPriorityType },
    { label: 'Urgente', value: 'URGENT' as TaskPriorityType }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filtersForm = this.fb.group({
      search: [''],
      status: [[]] as [TaskStatusType[]],
      priority: [[]] as [TaskPriorityType[]]
    });

    this.filtersForm.get('search')!.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.emitFilters());

    this.filtersForm.get('status')!.valueChanges.subscribe(() => this.emitFilters());
    this.filtersForm.get('priority')!.valueChanges.subscribe(() => this.emitFilters());
  }

  get searchControl(): FormControl {
    return this.filtersForm.get('search') as FormControl;
  }
  get statusControl(): FormControl {
    return this.filtersForm.get('status') as FormControl;
  }
  get priorityControl(): FormControl {
    return this.filtersForm.get('priority') as FormControl;
  }

  emitFilters(): void {
    const { search, status, priority } = this.filtersForm.value;
    this.filtersChanged.emit({
      search: search?.trim() || undefined,
      status: (status as TaskStatusType[])?.length ? status : undefined,
      priority: (priority as TaskPriorityType[])?.length ? priority : undefined
    });
  }

  clearFilters(): void {
    this.filtersForm.patchValue({ search: '', status: [], priority: [] });
    this.emitFilters();
  }

  hasActiveFilters(): boolean {
    const { search, status, priority } = this.filtersForm.value;
    return !!search?.trim() || (status as any[]).length > 0 || (priority as any[]).length > 0;
  }
}
