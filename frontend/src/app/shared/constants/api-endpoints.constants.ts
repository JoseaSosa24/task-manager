import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${environment.apiUrl}/auth/login`,
    REGISTER: `${environment.apiUrl}/auth/register`,
    REFRESH: `${environment.apiUrl}/auth/refresh`,
    //CHANGE_PASSWORD: `${environment.apiUrl}/auth/change-password`
  },
  TASKS: {
    BASE: `${environment.apiUrl}/tasks`,
    MY_TASKS: `${environment.apiUrl}/tasks`, 
    BY_ID: (id: number) => `${environment.apiUrl}/tasks/${id}`,
    BY_STATUS: (status: string) => `${environment.apiUrl}/tasks/status/${status}`,
    BY_PRIORITY: (priority: string) => `${environment.apiUrl}/tasks/priority/${priority}`,
    STATS: `${environment.apiUrl}/tasks/stats`,
    SEARCH: `${environment.apiUrl}/tasks/search`,
    UPDATE_STATUS: (id: number) => `${environment.apiUrl}/tasks/${id}/status`
  },
  USER: {
    BASE: `${environment.apiUrl}/user`,
    PROFILE: `${environment.apiUrl}/user/profile`,
    BY_ID: (id: number) => `${environment.apiUrl}/user/${id}`,
    CHANGE_PASSWORD: `${environment.apiUrl}/user/change-password`
  }
};