import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TaskService } from './task.service';
import { Request, PRIORITY_ORDER } from '../models/request';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requestsCache = signal<Request[]>([]);

  constructor(private taskService: TaskService) {}

  // Get all requests from cache
  getRequests(): Request[] {
    return this.requestsCache();
  }

  // Load all requests from backend
  loadRequests(): Observable<Request[]> {
    return this.taskService.getAllRequests().pipe(
      tap(requests => {
        this.requestsCache.set(requests);
      })
    );
  }

  // Get request by ID from cache
  getRequestById(id: number): Request | undefined {
    return this.requestsCache().find(req => req.id === id);
  }

  // Load single request from backend
  loadRequestById(id: number): Observable<Request> {
    return this.taskService.getRequestById(id).pipe(
      tap(request => {
        // Update cache
        const index = this.requestsCache().findIndex(r => r.id === id);
        if (index !== -1) {
          const updatedCache = [...this.requestsCache()];
          updatedCache[index] = request;
          this.requestsCache.set(updatedCache);
        } else {
          this.requestsCache.update(requests => [...requests, request]);
        }
      })
    );
  }

  // Create new request
  createRequest(request: Omit<Request, 'id' | 'createdDate' | 'lastUpdated'>): Observable<Request> {
    return this.taskService.createRequest(request).pipe(
      tap(newRequest => {
        this.requestsCache.update(requests => [...requests, newRequest]);
      })
    );
  }

  // Update request
  updateRequest(id: number, updates: Partial<Request>): Observable<Request> {
    return this.taskService.updateRequest(id, updates).pipe(
      tap(updatedRequest => {
        this.requestsCache.update(requests => 
          requests.map(req => req.id === id ? updatedRequest : req)
        );
      })
    );
  }

  // Search requests
  searchRequests(searchTerm: string): Observable<Request[]> {
    return this.taskService.searchRequests(searchTerm);
  }

  // Filter requests
  filterRequests(filters: { status?: string; priority?: string }): Observable<Request[]> {
    return this.taskService.filterRequests(filters);
  }

  // Sort requests locally
  sortRequests(requests: Request[], sortBy: string, sortDirection: 'asc' | 'desc' = 'asc'): Request[] {
    const sorted = [...requests];
    
    switch (sortBy) {
      case 'priority':
        sorted.sort((a, b) => {
          const priorityA = PRIORITY_ORDER[a.priority];
          const priorityB = PRIORITY_ORDER[b.priority];
          return sortDirection === 'asc' ? priorityA - priorityB : priorityB - priorityA;
        });
        break;
        
      case 'lastUpdated':
        sorted.sort((a, b) => {
          const dateA = a.lastUpdated || a.createdDate;
          const dateB = b.lastUpdated || b.createdDate;
          return sortDirection === 'asc' 
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        });
        break;
        
      case 'createdDate':
        sorted.sort((a, b) => {
          return sortDirection === 'asc'
            ? a.createdDate.getTime() - b.createdDate.getTime()
            : b.createdDate.getTime() - a.createdDate.getTime();
        });
        break;
        
      case 'title':
        sorted.sort((a, b) => {
          return sortDirection === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        });
        break;
        
      case 'status':
        const statusOrder = { 'Open': 1, 'In Progress': 2, 'Done': 3 };
        sorted.sort((a, b) => {
          const statusA = statusOrder[a.status];
          const statusB = statusOrder[b.status];
          return sortDirection === 'asc' ? statusA - statusB : statusB - statusA;
        });
        break;
    }
    
    return sorted;
  }

  // Assign agent
  assignAgent(requestId: number, agentId: number | null): Observable<any> {
    return this.taskService.assignRequest(requestId, agentId).pipe(
      tap(() => {
        this.requestsCache.update(requests => 
          requests.map(req => {
            if (req.id === requestId) {
              return {
                ...req,
                assignedAgentId: agentId || undefined,
                assignedAgentName: agentId ? `Agent ${agentId}` : undefined
              };
            }
            return req;
          })
        );
      })
    );
  }

  // Update status
  updateStatus(requestId: number, status: 'In Progress' | 'Done'): Observable<any> {
    return this.taskService.updateRequestStatus(requestId, status).pipe(
      tap(() => {
        this.requestsCache.update(requests => 
          requests.map(req => {
            if (req.id === requestId) {
              return {
                ...req,
                status: status,
                lastUpdated: new Date()
              };
            }
            return req;
          })
        );
      })
    );
  }
}