import { Component, OnInit } from '@angular/core';
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
  request?: Request;
  newComment = '';
  statusOptions = ['Open', 'In Progress', 'Done'];
  priorityOptions = ['Low', 'Medium', 'High'];
  
  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.request = this.requestService.getRequestById(id);
  }

  updateStatus(newStatus: string): void {
    if (!this.request) return;
    
    this.requestService.updateRequest(this.request.id, { status: newStatus as any });
    this.request = { ...this.request, status: newStatus as any };
  }

  updatePriority(newPriority: string): void {
    if (!this.request) return;
    
    this.requestService.updateRequest(this.request.id, { priority: newPriority as any });
    this.request = { ...this.request, priority: newPriority as any };
  }

  assignToCurrentUser(): void {
    if (!this.request || !this.authService.isAdmin()) return;
    
    const user = this.authService.getCurrentUser();
    this.requestService.updateRequest(this.request.id, { 
      assignedAgentId: user.id,
      assignedAgentName: user.username
    });
    this.request = { 
      ...this.request, 
      assignedAgentId: user.id,
      assignedAgentName: user.username
    };
  }

  unassignAgent(): void {
    if (!this.request || !this.authService.isAdmin()) return;
    
    this.requestService.updateRequest(this.request.id, { 
      assignedAgentId: undefined,
      assignedAgentName: undefined
    });
    this.request = { 
      ...this.request, 
      assignedAgentId: undefined,
      assignedAgentName: undefined
    };
  }

  addComment(): void {
    if (!this.request || !this.newComment.trim()) return;
    
    const user = this.authService.getCurrentUser();
    const comment = {
      id: Math.random(),
      requestId: this.request.id,
      userId: user.id,
      userName: user.username,
      content: this.newComment,
      createdAt: new Date()
    };
    
    const updatedComments = [...(this.request.comments || []), comment];
    this.requestService.updateRequest(this.request.id, { comments: updatedComments });
    this.request = { ...this.request, comments: updatedComments };
    this.newComment = '';
  }

  get canEdit(): boolean {
    return this.authService.isAdmin();
  }
}
