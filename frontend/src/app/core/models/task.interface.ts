// frontend/src/app/core/models/task.interface.ts

export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TaskPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatusType;
  priority: TaskPriorityType;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriorityType;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriorityType;
  dueDate?: string;
  status?: TaskStatusType;
}

export interface TaskFilter {
  status?: TaskStatusType[];
  priority?: TaskPriorityType[];
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  assigneeId?: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  todo: number;
  inProgress: number;
  inReview: number;
  cancelled: number;
  overdue: number;
  lowPriority: number;
  mediumPriority: number;
  highPriority: number;
  urgentPriority: number;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  size: number;
}

// Re-exportar los tipos legacy para compatibilidad (DEPRECATED)
/** @deprecated Use TaskStatusType instead */
export type TaskStatus = TaskStatusType;

/** @deprecated Use TaskPriorityType instead */
export type TaskPriority = TaskPriorityType;