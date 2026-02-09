import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TaskService } from './task.service';
import { Request, PRIORITY_ORDER } from '../models/request';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  // Local cache for faster UI updates
  private requestsCache = signal<Request[]>([]);

  constructor(private taskService: TaskService) {}

  // Get all requests (with caching)
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
        // Update cache with the single request
        const index = this.requestsCache().findIndex(r => r.id === id);
        if (index !== -1) {
          const updatedCache = [...this.requestsCache()];
          updatedCache[index] = request;
          this.requestsCache.set(updatedCache);
        } else {
          // Add to cache if not found
          this.requestsCache.update(requests => [...requests, request]);
        }
      })
    );
  }

  // Create new request
  createRequest(request: Omit<Request, 'id' | 'createdDate' | 'lastUpdated'>): Observable<Request> {
    return this.taskService.createRequest(request).pipe(
      tap(newRequest => {
        // Add to cache
        this.requestsCache.update(requests => [...requests, newRequest]);
      })
    );
  }

  // Update request
  updateRequest(id: number, updates: Partial<Request>): Observable<Request> {
    return this.taskService.updateRequest(id, updates).pipe(
      tap(updatedRequest => {
        // Update cache
        this.requestsCache.update(requests => 
          requests.map(req => req.id === id ? updatedRequest : req)
        );
      })
    );
  }

  // Search requests (returns Observable from backend)
  searchRequests(searchTerm: string): Observable<Request[]> {
    return this.taskService.searchRequests(searchTerm);
  }

  // Filter requests (returns Observable from backend)
  filterRequests(filters: { status?: string; priority?: string; assignedAgent?: string }): Observable<Request[]> {
    // Convert frontend filters to backend format
    const backendFilters: any = {};
    
    if (filters.status) {
      backendFilters.status = filters.status;
    }
    
    if (filters.priority) {
      backendFilters.priority = filters.priority;
    }
    
    // Note: Backend doesn't support assignedAgent filter directly
    return this.taskService.filterRequests(backendFilters);
  }

  // Sort requests locally (for UI responsiveness)
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

  // Assign/unassign agent
  assignAgent(requestId: number, agentId: number | null): Observable<any> {
    return this.taskService.assignRequest(requestId, agentId).pipe(
      tap(() => {
        // Update cache
        this.requestsCache.update(requests => 
          requests.map(req => {
            if (req.id === requestId) {
              return {
                ...req,
                assignedAgentId: agentId ?? undefined,
                assignedAgentName: agentId ? `Agent ${agentId}` : undefined
              };
            }
            return req;
          })
        );
      })
    );
  }

  // Update status (for agent progress)
  updateStatus(requestId: number, status: 'In Progress' | 'Done'): Observable<any> {
    return this.taskService.updateRequestStatus(requestId, status).pipe(
      tap(() => {
        // Update cache
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