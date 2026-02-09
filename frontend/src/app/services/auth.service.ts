import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User } from '../models/user';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);
  
  currentUserSignal = this.currentUser.asReadonly();
  isAuthenticatedSignal = this.isAuthenticated.asReadonly();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.apiService.getToken();
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  // Login using backend API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.apiService.post<any>('/users/login', credentials).toPromise();
      
      if (response && response.token) {
        this.apiService.setToken(response.token);
        
        // Your backend returns: { token, user: { id, username, role } }
        const user: User = {
          id: response.user.id,
          username: response.user.username,
          email: credentials.email,
          role: response.user.role === 'Admin' || response.user.role === 'admin' ? 'Admin' : 'Agent'
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        
        return {
          user: user,
          token: response.token
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Register using backend API
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Note: Your backend register endpoint requires admin authentication
      // You might need to adjust this or create a public registration endpoint
      const response = await this.apiService.post<any>('/users/register', userData).toPromise();
      
      if (response && response.id) {
        // After successful registration, automatically login
        return await this.login({
          email: userData.email,
          password: userData.password
        });
      }
      
      throw new Error('Registration failed');
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    this.apiService.removeToken();
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  // Check authentication
  checkAuth(): boolean {
    return this.isAuthenticated() && !!this.apiService.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin';
  }

  // Demo methods (keep for now, can be removed later)
  switchToAdmin(): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      const adminUser: User = { ...currentUser, role: 'Admin' };
      this.currentUser.set(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
    }
  }

  switchToAgent(): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      const agentUser: User = { ...currentUser, role: 'Agent' };
      this.currentUser.set(agentUser);
      localStorage.setItem('user', JSON.stringify(agentUser));
    }
  }
}