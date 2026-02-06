import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { UserSelectorComponent } from '../../components/user-selector/user-selector.component';
import { RequestCardComponent } from '../../components/request-card/request-card.component';
import { Request } from '../../models/request';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UserSelectorComponent, RequestCardComponent],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss']
})
export class RequestsListComponent implements OnInit {
  requests: Request[] = [];

  constructor(
    private requestService: RequestService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.requests = this.requestService.getRequests();
  }
}
