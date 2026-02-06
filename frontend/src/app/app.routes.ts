import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'requests',
    loadComponent: () => import('./pages/requests-list/requests-list.component').then(m => m.RequestsListComponent)
  },
  {
    path: 'requests/:id',
    loadComponent: () => import('./pages/request-detail/request-detail.component').then(m => m.RequestDetailComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];