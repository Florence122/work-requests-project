import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.scss']
})
export class UserSelectorComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserSignal();
  }

  switchToAdmin(): void {
    this.authService.switchToAdmin();
    this.currentUser = this.authService.currentUserSignal();
  }

  switchToAgent(): void {
    this.authService.switchToAgent();
    this.currentUser = this.authService.currentUserSignal();
  }
}
