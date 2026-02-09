import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { UserSelectorComponent } from '../../components/user-selector/user-selector.component';
import { CommentListComponent } from '../../components/comment-list/comment-list.component';
import { Request } from '../../models/request';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UserSelectorComponent, CommentListComponent],
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.scss']
})
export class RequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private requestService = inject(RequestService);
  public authService = inject(AuthService);

  request?: Request;
  newComment = '';
  isLoading = false;
  error = '';

  statusOptions = ['Open', 'In Progress', 'Done'];
  priorityOptions = ['Low', 'Medium', 'High'];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRequest(id);
  }

  loadRequest(id: number): void {
    this.isLoading = true;
    this.error = '';
    
    // Try to get from cache first
    const cachedRequest = this.requestService.getRequestById(id);
    if (cachedRequest) {
      this.request = cachedRequest;
      this.isLoading = false;
    } else {
      // Load from backend
      this.requestService.loadRequestById(id).subscribe({
        next: (request) => {
          this.request = request;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load request';
          this.isLoading = false;
        }
      });
    }
  }

  updateStatus(newStatus: 'Open' | 'In Progress' | 'Done'): void {
    if (!this.request) return;
    
    this.isLoading = true;
    this.requestService.updateRequest(this.request.id, { status: newStatus }).subscribe({
      next: (updatedRequest) => {
        this.request = updatedRequest;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to update status';
        this.isLoading = false;
      }
    });
  }

  updatePriority(newPriority: 'Low' | 'Medium' | 'High'): void {
    if (!this.request) return;
    
    this.isLoading = true;
    this.requestService.updateRequest(this.request.id, { priority: newPriority }).subscribe({
      next: (updatedRequest) => {
        this.request = updatedRequest;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to update priority';
        this.isLoading = false;
      }
    });
  }

  assignToCurrentUser(): void {
    if (!this.request || !this.authService.isAdmin()) return;
    
    const user = this.authService.getCurrentUser();
    if (!user) return;
    
    this.isLoading = true;
    this.requestService.assignAgent(this.request.id, user.id).subscribe({
      next: () => {
        // Update local request
        this.request = {
          ...this.request!,
          assignedAgentId: user.id,
          assignedAgentName: user.username
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to assign request';
        this.isLoading = false;
      }
    });
  }

  unassignAgent(): void {
    if (!this.request || !this.authService.isAdmin()) return;
    
    this.isLoading = true;
    this.requestService.assignAgent(this.request.id, null).subscribe({
      next: () => {
        // Update local request
        this.request = {
          ...this.request!,
          assignedAgentId: undefined,
          assignedAgentName: undefined
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to unassign agent';
        this.isLoading = false;
      }
    });
  }

  addComment(): void {
    if (!this.request || !this.newComment.trim()) return;
    
    // Note: You'll need to implement comments backend endpoint
    // For now, update locally
    const user = this.authService.getCurrentUser();
    if (!user) return;
    
    const comment = {
      id: Math.random(),
      requestId: this.request.id,
      userId: user.id,
      userName: user.username,
      content: this.newComment,
      createdAt: new Date()
    };
    
    const updatedComments = [...(this.request.comments || []), comment];
    this.request = {
      ...this.request,
      comments: updatedComments
    };
    
    this.newComment = '';
  }

  get canEdit(): boolean {
    return this.authService.isAdmin();
  }
}