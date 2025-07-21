// frontend/src/app/core/constants/task.constants.ts

// Enum para estados de tareas
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS', 
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'DONE', // Mapea a 'DONE' del backend
  CANCELLED = 'CANCELLED'
}

// Enum para prioridades de tareas
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Constantes adicionales para usar en comparaciones
export const TASK_STATUS_VALUES = {
  TODO: 'TODO' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  IN_REVIEW: 'IN_REVIEW' as const,
  COMPLETED: 'DONE' as const, // El backend usa 'DONE'
  CANCELLED: 'CANCELLED' as const
} as const;

export const TASK_PRIORITY_VALUES = {
  LOW: 'LOW' as const,
  MEDIUM: 'MEDIUM' as const,
  HIGH: 'HIGH' as const,
  URGENT: 'URGENT' as const
} as const;

// Labels para mostrar en la UI
export const TASK_STATUS_LABELS = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.COMPLETED]: 'Completed',
  [TaskStatus.CANCELLED]: 'Cancelled'
};

export const TASK_PRIORITY_LABELS = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.URGENT]: 'Urgent'
};

// Clases CSS para estados
export const TASK_STATUS_CLASSES = {
  [TaskStatus.TODO]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  [TaskStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  [TaskStatus.IN_REVIEW]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  [TaskStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

// Clases CSS para prioridades
export const TASK_PRIORITY_CLASSES = {
  [TaskPriority.LOW]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};