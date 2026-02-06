import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { UserSelectorComponent } from '../../components/user-selector/user-selector.component';
import { RequestCardComponent } from '../../components/request-card/request-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, UserSelectorComponent, RequestCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  requests = this.requestService.getRequests();
  
  constructor(
    private requestService: RequestService,
    public authService: AuthService
  ) {}

  get openCount(): number {
    return this.requests.filter(req => req.status === 'Open').length;
  }

  get inProgressCount(): number {
    return this.requests.filter(req => req.status === 'In Progress').length;
  }

  get doneCount(): number {
    return this.requests.filter(req => req.status === 'Done').length;
  }

  get recentRequests() {
    return [...this.requests]
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 5);
  }
}