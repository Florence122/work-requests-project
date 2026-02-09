import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';
  returnUrl = '/dashboard';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials)
      .then(() => {
        this.router.navigate([this.returnUrl]);
      })
      .catch(error => {
        this.errorMessage = error.message || 'Login failed. Please try again.';
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  isFormValid(): boolean {
    if (!this.credentials.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    if (!this.credentials.password.trim()) {
      this.errorMessage = 'Password is required';
      return false;
    }

    if (!this.isValidEmail(this.credentials.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Demo credentials for quick testing
  useDemoCredentials(role: 'admin' | 'agent'): void {
    if (role === 'admin') {
      this.credentials.email = 'admin@company.com';
      this.credentials.password = 'admin123';
    } else {
      this.credentials.email = 'agent@company.com';
      this.credentials.password = 'agent123';
    }
  }
}