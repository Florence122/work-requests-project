import { Injectable } from '@angular/core';
import { Request } from '../models/request';
import { MOCK_USERS } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requests: Request[] = [
    {
      id: 1,
      title: 'Fix login page issue',
      description: 'Users cannot login on mobile devices',
      priority: 'High',
      status: 'Open',
      createdDate: new Date('2024-02-01'),
      assignedAgentName: 'Agent Smith'
    },
    {
      id: 2,
      title: 'Update documentation',
      description: 'API documentation needs to be updated',
      priority: 'Low',
      status: 'Done',
      createdDate: new Date('2024-01-15'),
      assignedAgentName: 'Agent Smith',
      updatedDate: new Date('2024-01-20')
    },
    {
      id: 3,
      title: 'Performance optimization',
      description: 'Improve dashboard loading time',
      priority: 'Medium',
      status: 'In Progress',
      createdDate: new Date('2024-01-25'),
      assignedAgentName: 'Agent Smith'
    }
  ];

  getRequests(): Request[] {
    return [...this.requests];
  }

  getRequestById(id: number): Request | undefined {
    return this.requests.find(req => req.id === id);
  }

  createRequest(request: Omit<Request, 'id' | 'createdDate'>): Request {
    const newRequest: Request = {
      ...request,
      id: this.requests.length + 1,
      createdDate: new Date()
    };
    this.requests.push(newRequest);
    return newRequest;
  }

  updateRequest(id: number, updates: Partial<Request>): Request | undefined {
    const index = this.requests.findIndex(req => req.id === id);
    if (index === -1) return undefined;

    this.requests[index] = {
      ...this.requests[index],
      ...updates,
      updatedDate: new Date()
    };
    return this.requests[index];
  }

  deleteRequest(id: number): boolean {
    const index = this.requests.findIndex(req => req.id === id);
    if (index === -1) return false;
    
    this.requests.splice(index, 1);
    return true;
  }

  searchRequests(searchTerm: string): Request[] {
    if (!searchTerm.trim()) return this.requests;
    
    return this.requests.filter(req =>
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filterRequests(status?: string, priority?: string): Request[] {
    return this.requests.filter(req => {
      if (status && req.status !== status) return false;
      if (priority && req.priority !== priority) return false;
      return true;
    });
  }
}