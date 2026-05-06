import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { RechargeFlow } from './components/recharge-flow/recharge-flow';
import { Profile } from './components/profile/profile';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

import { AdminLayout } from './admin/admin.layout';
import { AdminDashboard } from './admin/admin-dashboard';
import { AdminUsersPage } from './admin/admin-users';
import { AdminOperatorsPage } from './admin/admin-operators';
import { AdminTransactionsPage } from './admin/admin-transactions';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/login');
};

const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();
  if (user && user.role === 'ADMIN') {
    return true;
  }
  return router.parseUrl('/dashboard');
};

const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/dashboard');
};

export const routes: Routes = [
  { path: '', component: Home, canActivate: [guestGuard] },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'recharge', component: RechargeFlow, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { 
    path: 'admin', 
    component: AdminLayout, 
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: AdminUsersPage },
      { path: 'operators', component: AdminOperatorsPage },
      { path: 'transactions', component: AdminTransactionsPage }
    ]
  },
  { path: '**', redirectTo: '' }
];
