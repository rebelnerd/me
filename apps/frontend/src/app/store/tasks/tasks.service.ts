import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITask, ICreateTaskRequest, IUpdateTaskRequest } from '@app/interfaces';
import { environment } from '../../../envs/environment';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private baseUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getDailyTasks(date: string): Observable<ITask[]> {
    return this.http.get<ITask[]>(`${this.baseUrl}/daily`, {
      params: { date },
    });
  }

  getBacklog(): Observable<ITask[]> {
    return this.http.get<ITask[]>(`${this.baseUrl}/backlog`);
  }

  getFocusTask(date: string): Observable<ITask | null> {
    return this.http.get<ITask | null>(`${this.baseUrl}/focus`, {
      params: { date },
    });
  }

  createTask(data: ICreateTaskRequest): Observable<ITask> {
    return this.http.post<ITask>(this.baseUrl, data);
  }

  updateTask(id: number, data: IUpdateTaskRequest): Observable<ITask> {
    return this.http.patch<ITask>(`${this.baseUrl}/${id}`, data);
  }

  scheduleTask(id: number, date: string): Observable<ITask> {
    return this.http.patch<ITask>(`${this.baseUrl}/${id}/schedule`, { date });
  }

  unscheduleTask(id: number): Observable<ITask> {
    return this.http.patch<ITask>(`${this.baseUrl}/${id}/unschedule`, {});
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reorderTasks(date: string, taskIds: number[]): Observable<ITask[]> {
    return this.http.patch<ITask[]>(`${this.baseUrl}/reorder`, { taskIds }, {
      params: { date },
    });
  }
}
