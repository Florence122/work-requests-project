import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { UserSelectorComponent } from '../../components/user-selector/user-selector.component';
import { RequestCardComponent } from '../../components/request-card/request-card.component';
import { RequestFormComponent } from '../../components/request-form/request-form.component';
import { Request } from '../../models/request';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, UserSelectorComponent, RequestCardComponent, RequestFormComponent],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss']
})
export class RequestsListComponent implements OnInit {
  // All requests
  allRequests = signal<Request[]>([]);
  
  // Filter and search state
  searchTerm = signal('');
  selectedStatus = signal<string>('');
  selectedPriority = signal<string>('');
  selectedAssignment = signal<string>('');
  sortBy = signal<string>('lastUpdated');
  sortDirection = signal<'asc' | 'desc'>('desc');
  
  // Show/hide create form
  showCreateForm = signal(false);
  
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
    
    // Apply search
    const term = this.searchTerm();
    if (term.trim()) {
      requests = this.requestService.searchRequests(term);
    }
    
    // Apply filters
    const filters = {
      status: this.selectedStatus() || undefined,
      priority: this.selectedPriority() || undefined,
      assignedAgent: this.selectedAssignment() === 'All' ? undefined : this.selectedAssignment()
    };
    
    requests = this.requestService.filterRequests(filters);
    
    // Apply sorting
    requests = this.requestService.sortRequests(
      requests,
      this.sortBy(),
      this.sortDirection()
    );
    
    return requests;
  });

  constructor(
    private requestService: RequestService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check URL for create parameter
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.showCreateForm.set(true);
      }
    });
    
    // Load initial data
    this.loadRequests();
  }

  loadRequests(): void {
    this.allRequests.set(this.requestService.getRequests());
  }

  onSearch(): void {
    // Search is reactive via computed property
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
    this.loadRequests();
    // Clear query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
    // Clear query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  getSortLabel(): string {
    const option = this.sortOptions.find(opt => opt.value === this.sortBy());
    return option ? option.label : 'Sort';
  }

  // Get counts for filter badges
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