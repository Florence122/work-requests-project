import { Injectable } from '@angular/core';
import { Request, PRIORITY_ORDER } from '../models/request';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requests: Request[] = [
    {
      id: 1,
      title: 'Fix login page issue',
      description: 'Users cannot login on mobile devices. Need to fix responsive design and touch interactions.',
      priority: 'High',
      status: 'Open',
      createdDate: new Date('2024-02-01T10:30:00'),
      lastUpdated: new Date('2024-02-06T09:15:00'),
      assignedAgentName: 'Agent Smith'
    },
    {
      id: 2,
      title: 'Update API documentation',
      description: 'API documentation needs to be updated with new endpoints and authentication methods.',
      priority: 'Low',
      status: 'Done',
      createdDate: new Date('2024-01-15T14:20:00'),
      lastUpdated: new Date('2024-01-20T16:45:00'),
      assignedAgentName: 'Agent Smith'
    },
    {
      id: 3,
      title: 'Performance optimization for dashboard',
      description: 'Improve dashboard loading time by optimizing database queries and implementing caching.',
      priority: 'Medium',
      status: 'In Progress',
      createdDate: new Date('2024-01-25T09:00:00'),
      lastUpdated: new Date('2024-02-05T11:30:00'),
      assignedAgentName: 'Agent Smith'
    },
    {
      id: 4,
      title: 'Implement user notifications',
      description: 'Add real-time notifications for request updates and comments.',
      priority: 'High',
      status: 'Open',
      createdDate: new Date('2024-02-03T13:45:00'),
      lastUpdated: new Date('2024-02-04T10:20:00')
    },
    {
      id: 5,
      title: 'Mobile app UI improvements',
      description: 'Update the mobile app UI for better user experience and accessibility.',
      priority: 'Medium',
      status: 'In Progress',
      createdDate: new Date('2024-01-30T16:10:00'),
      lastUpdated: new Date('2024-02-06T08:45:00'),
      assignedAgentName: 'Agent Smith'
    },
    {
      id: 6,
      title: 'Database backup automation',
      description: 'Automate database backup process and implement disaster recovery procedures.',
      priority: 'Low',
      status: 'Open',
      createdDate: new Date('2024-02-02T11:20:00'),
      lastUpdated: new Date('2024-02-02T11:20:00')
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
      createdDate: new Date(),
      lastUpdated: new Date()
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
      lastUpdated: new Date()
    };
    return this.requests[index];
  }

  // Enhanced search with better matching
  searchRequests(searchTerm: string): Request[] {
    if (!searchTerm.trim()) return this.requests;
    
    const lowerCaseTerm = searchTerm.toLowerCase();
    
    return this.requests.filter(req =>
      req.title.toLowerCase().includes(lowerCaseTerm) ||
      req.description.toLowerCase().includes(lowerCaseTerm) ||
      req.status.toLowerCase().includes(lowerCaseTerm) ||
      req.priority.toLowerCase().includes(lowerCaseTerm)
    );
  }

  // Enhanced filtering with multiple criteria
  filterRequests(filters: {
    status?: string;
    priority?: string;
    assignedAgent?: string;
  }): Request[] {
    return this.requests.filter(req => {
      if (filters.status && req.status !== filters.status) return false;
      if (filters.priority && req.priority !== filters.priority) return false;
      if (filters.assignedAgent) {
        if (filters.assignedAgent === 'unassigned' && req.assignedAgentName) return false;
        if (filters.assignedAgent === 'assigned' && !req.assignedAgentName) return false;
      }
      return true;
    });
  }

  // Sorting methods
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
}