import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.checkAuth()) {
    return true;
  }

  // Redirect to login page with return URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: router.url }
  });
};

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.checkAuth() && authService.isAdmin()) {
    return true;
  }

  // Redirect to dashboard if not admin
  return router.createUrlTree(['/dashboard']);
};