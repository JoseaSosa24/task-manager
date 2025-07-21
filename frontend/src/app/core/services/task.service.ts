import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilter, 
  TaskStats,
  TasksResponse,
  TaskStatus,
  TaskPriority 
} from '../models/task.interface';
import { PaginationParams } from '../models/api.interface';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private statsSubject = new BehaviorSubject<TaskStats | null>(null);

  public tasks$ = this.tasksSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Obtener todas las tareas del usuario
  getMyTasks(): Observable<Task[]> {
    this.loadingSubject.next(true);
    return this.http.get<Task[]>(API_ENDPOINTS.TASKS.MY_TASKS)
      .pipe(
        tap(tasks => {
          this.tasksSubject.next(tasks);
          this.updateStats(tasks);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  // ✅ Obtener estadísticas del usuario
  getMyTaskStats(): Observable<TaskStats> {
    return this.http.get<TaskStats>(API_ENDPOINTS.TASKS.STATS)
      .pipe(
        tap(stats => this.statsSubject.next(stats))
      );
  }

  // ✅ Obtener tareas por estado
  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.http.get<Task[]>(API_ENDPOINTS.TASKS.BY_STATUS(status));
  }

  // ✅ Obtener tareas por prioridad
  getTasksByPriority(priority: TaskPriority): Observable<Task[]> {
    return this.http.get<Task[]>(API_ENDPOINTS.TASKS.BY_PRIORITY(priority));
  }

  // ✅ Buscar tareas
  searchTasks(query: string): Observable<Task[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Task[]>(API_ENDPOINTS.TASKS.SEARCH, { params });
  }

  // ✅ Obtener tarea por ID
  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(API_ENDPOINTS.TASKS.BY_ID(id));
  }

  // ✅ Crear nueva tarea
  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(API_ENDPOINTS.TASKS.BASE, task)
      .pipe(
        tap(newTask => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([newTask, ...currentTasks]);
          this.updateStats([newTask, ...currentTasks]);
        })
      );
  }

  // ✅ Actualizar tarea
  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(API_ENDPOINTS.TASKS.BY_ID(id), task)
      .pipe(
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const index = currentTasks.findIndex(t => t.id === id);
          if (index !== -1) {
            currentTasks[index] = updatedTask;
            this.tasksSubject.next([...currentTasks]);
            this.updateStats(currentTasks);
          }
        })
      );
  }

  // ✅ Eliminar tarea
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TASKS.BY_ID(id))
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const filteredTasks = currentTasks.filter(task => task.id !== id);
          this.tasksSubject.next(filteredTasks);
          this.updateStats(filteredTasks);
        })
      );
  }

  // ✅ Actualizar estado de tarea
  updateTaskStatus(id: number, status: TaskStatus): Observable<Task> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<Task>(API_ENDPOINTS.TASKS.UPDATE_STATUS(id), null, { params })
      .pipe(
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const index = currentTasks.findIndex(t => t.id === id);
          if (index !== -1) {
            currentTasks[index] = updatedTask;
            this.tasksSubject.next([...currentTasks]);
            this.updateStats(currentTasks);
          }
        })
      );
  }

  // ✅ Filtrar tareas localmente
  filterTasks(filter: TaskFilter): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => {
        let filteredTasks = tasks;
        
        if (filter.status?.length) {
          filteredTasks = filteredTasks.filter(task => 
            filter.status!.includes(task.status)
          );
        }
        
        if (filter.priority?.length) {
          filteredTasks = filteredTasks.filter(task => 
            filter.priority!.includes(task.priority)
          );
        }
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower)
          );
        }

        if (filter.dueDateFrom) {
          filteredTasks = filteredTasks.filter(task => 
            task.dueDate && new Date(task.dueDate) >= new Date(filter.dueDateFrom!)
          );
        }

        if (filter.dueDateTo) {
          filteredTasks = filteredTasks.filter(task => 
            task.dueDate && new Date(task.dueDate) <= new Date(filter.dueDateTo!)
          );
        }

        return filteredTasks;
      })
    );
  }

  // ✅ Actualizar estadísticas localmente
  private updateStats(tasks: Task[]): void {
    const stats: TaskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'DONE').length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
      //cancelled: tasks.filter(t => t.status === 'CANCELLED').length,
      overdue: tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
      ).length,
      lowPriority: tasks.filter(t => t.priority === 'LOW').length,
      mediumPriority: tasks.filter(t => t.priority === 'MEDIUM').length,
      highPriority: tasks.filter(t => t.priority === 'HIGH').length,
      urgentPriority: tasks.filter(t => t.priority === 'URGENT').length
    };
    
    this.statsSubject.next(stats);
  }

  // ✅ Resetear estado
  clearTasks(): void {
    this.tasksSubject.next([]);
    this.statsSubject.next(null);
  }
}