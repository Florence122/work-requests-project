import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  imports: [CommonModule, RouterLink, FormsModule, UserSelectorComponent, RequestCardComponent, RequestFormComponent],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss']
})
export class RequestsListComponent implements OnInit {
  allRequests: Request[] = [];
  filteredRequests: Request[] = [];
  searchTerm = '';
  selectedStatus = '';
  selectedPriority = '';
  showCreateForm = false;
  
  statusOptions = ['Open', 'In Progress', 'Done'];
  priorityOptions = ['Low', 'Medium', 'High'];

  constructor(
    private requestService: RequestService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.showCreateForm = true;
      }
    });
    this.loadRequests();
  }

  loadRequests(): void {
    this.allRequests = this.requestService.getRequests();
    this.filteredRequests = [...this.allRequests];
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.filteredRequests = this.requestService.searchRequests(this.searchTerm);
    } else {
      this.filteredRequests = [...this.allRequests];
    }
    this.applyFilters();
  }

  applyFilters(): void {
    let results = [...this.allRequests];
    
    if (this.searchTerm.trim()) {
      results = this.requestService.searchRequests(this.searchTerm);
    }
    
    results = this.requestService.filterRequests(
      this.selectedStatus || undefined,
      this.selectedPriority || undefined
    );
    
    this.filteredRequests = results;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.filteredRequests = [...this.allRequests];
  }

  onRequestCreated(): void {
    this.showCreateForm = false;
    this.loadRequests();
  }

  cancelCreate(): void {
    this.showCreateForm = false;
  }
}