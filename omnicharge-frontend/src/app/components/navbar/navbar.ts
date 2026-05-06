import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar glass-panel">
      <div class="container navbar-container">
        <a routerLink="/" class="logo flex items-center gap-2">
          <div class="logo-icon">⚡</div>
          <span class="logo-text">Omnicharge</span>
        </a>

        <div class="nav-links">
          <ng-container *ngIf="isLoggedIn(); else guestLinks">
            <a routerLink="/profile" class="welcome-text" style="text-decoration: none; cursor: pointer;">
              Hi, <span class="text-primary" style="font-weight: 700;">{{ currentUser?.username }}</span>
            </a>
            <a *ngIf="currentUser?.role === 'ADMIN'" routerLink="/admin" routerLinkActive="active" class="nav-link" style="color: var(--error); font-weight: 700;">Admin Panel</a>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            <a routerLink="/recharge" routerLinkActive="active" class="nav-link">Recharge</a>
            <button (click)="logout()" class="btn btn-secondary nav-btn">Logout</button>
          </ng-container>

          <ng-template #guestLinks>
            <a routerLink="/login" routerLinkActive="active" class="nav-link">Login</a>
            <a routerLink="/register" class="btn btn-primary nav-btn">Get Started</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
    }
    .navbar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
    }
    .logo {
      text-decoration: none;
    }
    .logo-icon {
      font-size: 1.5rem;
      background: var(--primary);
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
      letter-spacing: -0.5px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      transition: var(--transition);
    }
    .nav-link:hover, .nav-link.active {
      color: var(--primary);
    }
    .welcome-text {
      color: var(--text-muted);
      font-weight: 500;
      margin-right: 0.5rem;
    }
    .nav-btn {
      padding: 0.5rem 1.25rem;
    }
  `]
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);

  get currentUser(): AuthResponse | null {
    return this.authService.getCurrentUser();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
