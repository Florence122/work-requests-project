import { Injectable, signal } from '@angular/core';
import { User, MOCK_USERS } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User>(MOCK_USERS[0]); // Default to Admin
  currentUserSignal = this.currentUser.asReadonly();

  setCurrentUser(user: User): void {
    this.currentUser.set(user);
  }

  getCurrentUser(): User {
    return this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser().role === 'Admin';
  }

  switchToAdmin(): void {
    this.currentUser.set(MOCK_USERS[0]);
  }

  switchToAgent(): void {
    this.currentUser.set(MOCK_USERS[1]);
  }
}