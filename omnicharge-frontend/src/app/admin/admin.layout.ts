import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="admin-container flex">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar glass-panel">
        <div class="sidebar-header flex items-center gap-2 mb-4">
          <div class="logo-icon" style="background: var(--error);">⚡</div>
          <span class="logo-text">Admin Panel</span>
        </div>
        
        <nav class="sidebar-nav flex-col gap-2">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="sidebar-link">📊 Dashboard</a>
          <a routerLink="/admin/users" routerLinkActive="active" class="sidebar-link">👥 Users</a>
          <a routerLink="/admin/operators" routerLinkActive="active" class="sidebar-link">📶 Operators & Plans</a>
          <a routerLink="/admin/transactions" routerLinkActive="active" class="sidebar-link">💳 All Transactions</a>
        </nav>

        <div class="sidebar-footer mt-4" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
          <a routerLink="/dashboard" class="sidebar-link" style="color: var(--text-muted);">← Back to App</a>
          <button (click)="logout()" class="btn btn-secondary mt-2" style="width: 100%;">Logout</button>
        </div>
      </aside>

      <!-- Admin Main Content -->
      <main class="admin-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      min-height: 100vh;
      background: var(--background);
    }
    .admin-sidebar {
      width: 280px;
      padding: 1.5rem;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      border-radius: 0;
    }
    .admin-main {
      flex: 1;
      margin-left: 280px;
      padding: 2rem;
      min-height: 100vh;
    }
    .logo-icon {
      font-size: 1.5rem;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      color: white;
    }
    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .sidebar-nav {
      flex: 1;
    }
    .sidebar-link {
      display: block;
      padding: 0.75rem 1rem;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 8px;
      transition: var(--transition);
      font-weight: 500;
    }
    .sidebar-link:hover, .sidebar-link.active {
      background: rgba(79, 70, 229, 0.1);
      color: var(--primary);
    }
  `]
})
export class AdminLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
