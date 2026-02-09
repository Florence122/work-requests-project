import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { UserSelectorComponent } from '../../components/user-selector/user-selector.component';
import { RequestCardComponent } from '../../components/request-card/request-card.component';
import { RequestFormComponent } from '../../components/request-form/request-form.component';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserSelectorComponent, RequestCardComponent, RequestFormComponent],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss']
})
export class RequestsListComponent implements OnInit {
  private requestService = inject(RequestService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // All requests from cache
  allRequests = computed(() => this.requestService.getRequests());
  
  // Filter and search state
  searchTerm = signal('');
  selectedStatus = signal<string>('');
  selectedPriority = signal<string>('');
  selectedAssignment = signal<string>('');
  sortBy = signal<string>('lastUpdated');
  sortDirection = signal<'asc' | 'desc'>('desc');
  
  // Show/hide create form
  showCreateForm = signal(false);
  
  // Loading state
  isLoading = signal(false);
  
  // Options
  statusOptions = ['Open', 'In Progress', 'Done'];
  priorityOptions = ['Low', 'Medium', 'High'];
  assignmentOptions = ['All', 'Assigned', 'Unassigned'];
  sortOptions = [
    { value: 'lastUpdated', label: 'Last Updated' },
    { value: 'createdDate', label: 'Created Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' }
  ];

  // Computed filtered and sorted requests
  filteredRequests = computed(() => {
    let requests = this.allRequests();
    
    // Apply search filter
    const term = this.searchTerm();
    if (term.trim()) {
      // Filter locally since search is already done on the whole list
      requests = requests.filter(req =>
        req.title.toLowerCase().includes(term.toLowerCase()) ||
        req.description.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // Apply status filter
    if (this.selectedStatus()) {
      requests = requests.filter(req => req.status === this.selectedStatus());
    }
    
    // Apply priority filter
    if (this.selectedPriority()) {
      requests = requests.filter(req => req.priority === this.selectedPriority());
    }
    
    // Apply assignment filter
    if (this.selectedAssignment() === 'Assigned') {
      requests = requests.filter(req => req.assignedAgentName);
    } else if (this.selectedAssignment() === 'Unassigned') {
      requests = requests.filter(req => !req.assignedAgentName);
    }
    
    // Apply sorting
    return this.requestService.sortRequests(
      requests,
      this.sortBy(),
      this.sortDirection()
    );
  });

  ngOnInit(): void {
    // Check URL for create parameter
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.showCreateForm.set(true);
      }
    });
    
    // Load initial data from backend
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    
    this.requestService.loadRequests().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading requests:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    // Could implement debounced search here
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedPriority.set('');
    this.selectedAssignment.set('');
    this.sortBy.set('lastUpdated');
    this.sortDirection.set('desc');
  }

  toggleSortDirection(): void {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
  }

  getSortIcon(): string {
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  onRequestCreated(): void {
    this.showCreateForm.set(false);
    this.loadRequests(); // Reload from backend
    
    // Clear query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  getSortLabel(): string {
    const option = this.sortOptions.find(opt => opt.value === this.sortBy());
    return option ? option.label : 'Sort';
  }

  // Helper methods for counts
  getStatusCount(status: string): number {
    return this.allRequests().filter(req => req.status === status).length;
  }

  getPriorityCount(priority: string): number {
    return this.allRequests().filter(req => req.priority === priority).length;
  }

  getAssignedCount(): number {
    return this.allRequests().filter(req => req.assignedAgentName).length;
  }

  getUnassignedCount(): number {
    return this.allRequests().filter(req => !req.assignedAgentName).length;
  }
}