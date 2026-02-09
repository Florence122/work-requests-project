import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Request } from '../models/request';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private apiService: ApiService) {}

  // Convert frontend Request to backend Task format
  private requestToTask(request: any): any {
    return {
      title: request.title,
      description: request.description || '',
      priority: this.mapPriorityToBackend(request.priority),
      status: this.mapStatusToBackend(request.status),
      assigned_to: request.assignedAgentId || null
    };
  }

  // Convert backend Task to frontend Request format
  private taskToRequest(task: any): Request {
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: this.mapPriorityFromBackend(task.priority),
      status: this.mapStatusFromBackend(task.status),
      createdDate: new Date(task.created_at),
      lastUpdated: new Date(task.updated_at),
      assignedAgentId: task.assigned_to || undefined,
      assignedAgentName: task.assigned_agent_name || undefined,
      comments: task.comments || []
    };
  }

  private mapStatusToBackend(status: string): string {
    switch(status) {
      case 'Open': return 'open';
      case 'In Progress': return 'in_progress';
      case 'Done': return 'done';
      default: return 'open';
    }
  }

  private mapStatusFromBackend(status: string): 'Open' | 'In Progress' | 'Done' {
    switch(status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'done': return 'Done';
      default: return 'Open';
    }
  }

  private mapPriorityToBackend(priority: string): string {
    switch(priority) {
      case 'Low': return 'low';
      case 'Medium': return 'mid';
      case 'High': return 'high';
      default: return 'mid';
    }
  }

  private mapPriorityFromBackend(priority: string): 'Low' | 'Medium' | 'High' {
    switch(priority) {
      case 'low': return 'Low';
      case 'mid': return 'Medium';
      case 'high': return 'High';
      default: return 'Medium';
    }
  }

  // CREATE REQUEST (POST /tasks)
  createRequest(requestData: any): Observable<Request> {
    const taskData = this.requestToTask(requestData);
    return this.apiService.post<any>('/tasks', taskData).pipe(
      map(task => this.taskToRequest(task))
    );
  }

  // GET ALL REQUESTS (GET /tasks)
  getAllRequests(): Observable<Request[]> {
    return this.apiService.get<any[]>('/tasks').pipe(
      map(tasks => tasks.map(task => this.taskToRequest(task)))
    );
  }

  // GET SINGLE REQUEST (GET /tasks/:id)
  getRequestById(id: number): Observable<Request> {
    return this.apiService.get<any>(`/tasks/${id}`).pipe(
      map(task => this.taskToRequest(task))
    );
  }

  // UPDATE REQUEST (PUT /tasks/:id)
  updateRequest(id: number, requestData: any): Observable<Request> {
    const taskData: any = {};
    
    if (requestData.title !== undefined) taskData.title = requestData.title;
    if (requestData.description !== undefined) taskData.description = requestData.description;
    if (requestData.priority !== undefined) taskData.priority = this.mapPriorityToBackend(requestData.priority);
    if (requestData.status !== undefined) taskData.status = this.mapStatusToBackend(requestData.status);
    if (requestData.assignedAgentId !== undefined) taskData.assigned_to = requestData.assignedAgentId;

    return this.apiService.put<any>(`/tasks/${id}`, taskData).pipe(
      map(task => this.taskToRequest(task))
    );
  }

  // SEARCH REQUESTS (GET /tasks/search)
  searchRequests(query: string): Observable<Request[]> {
    return this.apiService.get<any[]>(`/tasks/search?q=${query}`).pipe(
      map(tasks => tasks.map(task => this.taskToRequest(task)))
    );
  }

  // FILTER REQUESTS (GET /tasks/filter)
  filterRequests(filters: { status?: string; priority?: string }): Observable<Request[]> {
    const backendFilters: any = {};
    
    if (filters.status) {
      backendFilters.status = this.mapStatusToBackend(filters.status);
    }
    
    if (filters.priority) {
      backendFilters.priority = this.mapPriorityToBackend(filters.priority);
    }

    return this.apiService.get<any[]>('/tasks/filter', backendFilters).pipe(
      map(tasks => tasks.map(task => this.taskToRequest(task)))
    );
  }

  // SORT REQUESTS (GET /tasks/sort/:field)
  sortRequests(field: string): Observable<Request[]> {
    // Map frontend field names to backend field names
    const backendFieldMap: { [key: string]: string } = {
      'lastUpdated': 'updated_at',
      'createdDate': 'created_at',
      'priority': 'priority',
      'title': 'title',
      'status': 'status'
    };
    
    const backendField = backendFieldMap[field] || 'updated_at';
    return this.apiService.get<any[]>(`/tasks/sort/${backendField}`).pipe(
      map(tasks => tasks.map(task => this.taskToRequest(task)))
    );
  }

  // ASSIGN/UNASSIGN AGENT (PUT /tasks/:id/assign)
  assignRequest(id: number, agentId: number | null): Observable<any> {
    return this.apiService.put(`/tasks/${id}/assign`, { assigned_to: agentId });
  }

  // UPDATE REQUEST STATUS (PUT /tasks/:id/progress)
  updateRequestStatus(id: number, status: 'In Progress' | 'Done'): Observable<any> {
    const backendStatus = status === 'In Progress' ? 'in_progress' : 'done';
    return this.apiService.put(`/tasks/${id}/progress`, { status: backendStatus });
  }
}