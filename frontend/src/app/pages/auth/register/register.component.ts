import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  userData: RegisterRequest = {
    username: '',
    email: '',
    password: '',
    role: 'Agent'
  };
  
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.userData)
      .then(() => {
        this.successMessage = 'Account created successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      })
      .catch(error => {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  isFormValid(): boolean {
    // Reset messages
    this.errorMessage = '';

    // Validate username
    if (!this.userData.username.trim()) {
      this.errorMessage = 'Username is required';
      return false;
    }

    if (this.userData.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      return false;
    }

    // Validate email
    if (!this.userData.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    if (!this.isValidEmail(this.userData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    // Validate password
    if (!this.userData.password.trim()) {
      this.errorMessage = 'Password is required';
      return false;
    }

    if (this.userData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return false;
    }

    // Validate password confirmation
    if (!this.confirmPassword.trim()) {
      this.errorMessage = 'Please confirm your password';
      return false;
    }

    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    // Validate role
    if (!this.userData.role) {
      this.errorMessage = 'Please select a role';
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  // Check password strength
  getPasswordStrength(): { score: number; label: string; color: string } {
    const password = this.userData.password;
    let score = 0;

    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score === 0) return { score: 0, label: 'Very Weak', color: 'bg-red-500' };
    if (score === 1) return { score: 20, label: 'Weak', color: 'bg-red-400' };
    if (score === 2) return { score: 40, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { score: 60, label: 'Good', color: 'bg-yellow-400' };
    if (score === 4) return { score: 80, label: 'Strong', color: 'bg-green-500' };
    return { score: 100, label: 'Very Strong', color: 'bg-green-600' };
  }
}