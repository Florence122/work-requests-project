import { Injectable, signal } from '@angular/core';
import { User, MOCK_USERS } from '../models/user';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User>(MOCK_USERS[0]); // Default to Admin
  private isAuthenticated = signal<boolean>(true); // Start as authenticated for demo
  currentUserSignal = this.currentUser.asReadonly();
  isAuthenticatedSignal = this.isAuthenticated.asReadonly();

  // Mock users for authentication
  private mockUsers = [
    { id: 1, username: 'Admin User', email: 'admin@company.com', role: 'Admin' as const, password: 'admin123' },
    { id: 2, username: 'Agent Smith', email: 'agent@company.com', role: 'Agent' as const, password: 'agent123' },
    { id: 3, username: 'John Doe', email: 'john@company.com', role: 'Agent' as const, password: 'john123' }
  ];

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

  // Login method
  login(credentials: LoginRequest): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.mockUsers.find(u => 
          u.email === credentials.email && u.password === credentials.password
        );
        
        if (user) {
          const { password, ...userWithoutPassword } = user;
          this.currentUser.set(userWithoutPassword);
          this.isAuthenticated.set(true);
          
          resolve({
            user: userWithoutPassword,
            token: 'mock-jwt-token'
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800); // Simulate API delay
    });
  }

  // Register method
  register(userData: RegisterRequest): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        const existingUser = this.mockUsers.find(u => u.email === userData.email);
        
        if (existingUser) {
          reject(new Error('Email already registered'));
          return;
        }

        // Create new user
        const newUser = {
          id: this.mockUsers.length + 1,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          password: userData.password
        };

        this.mockUsers.push(newUser);
        
        const { password, ...userWithoutPassword } = newUser;
        this.currentUser.set(userWithoutPassword);
        this.isAuthenticated.set(true);
        
        resolve({
          user: userWithoutPassword,
          token: 'mock-jwt-token'
        });
      }, 800); // Simulate API delay
    });
  }

  // Logout method
  logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isAuthenticated.set(false);
        this.currentUser.set(MOCK_USERS[0]); // Reset to default
        resolve();
      }, 300);
    });
  }

  // Check authentication
  checkAuth(): boolean {
    return this.isAuthenticated();
  }
}