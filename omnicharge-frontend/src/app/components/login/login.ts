import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="container flex justify-center items-center animate-fade-in" style="min-height: calc(100vh - 150px);">
      <div class="card auth-card">
        <div class="text-center mb-4">
          <h2>Welcome Back</h2>
          <p>Login to manage your recharges</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="input-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" class="input-control" 
                   [(ngModel)]="credentials.username" required placeholder="Enter your username">
          </div>

          <div class="input-group">
            <label for="password">Password</label>
            <div style="position: relative;">
              <input [type]="showPassword ? 'text' : 'password'" id="password" name="password" class="input-control" 
                     [(ngModel)]="credentials.password" required placeholder="Enter your password"
                     style="padding-right: 40px;">
              <button type="button" (click)="togglePassword()" 
                      style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="input-group">
            <label for="confirmPassword">Confirm Password</label>
            <div style="position: relative;">
              <input [type]="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" name="confirmPassword" class="input-control"
                     [(ngModel)]="confirmPassword" required placeholder="Re-enter your password"
                     style="padding-right: 40px;"
                     [class.input-error]="confirmPassword && credentials.password !== confirmPassword">
              <button type="button" (click)="toggleConfirmPassword()"
                      style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg *ngIf="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div *ngIf="confirmPassword && credentials.password !== confirmPassword" class="mismatch-msg">
              Passwords do not match.
            </div>
          </div>

          <div *ngIf="error" class="error-box mb-3">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary mt-2" style="width: 100%;" [disabled]="!loginForm.form.valid || isLoading || credentials.password !== confirmPassword">
            <span *ngIf="isLoading">Logging in...</span>
            <span *ngIf="!isLoading">Login</span>
          </button>
        </form>

        <div class="text-center mt-4" style="font-size: 0.9rem;">
          <span style="color: var(--text-muted);">Don't have an account?</span>
          <a routerLink="/register" class="text-primary" style="text-decoration: none; font-weight: 500; margin-left: 0.5rem;">Sign up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 2rem;
    }
    .error-box {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .input-error {
      border-color: var(--error, #ef4444) !important;
    }
    .mismatch-msg {
      color: var(--error, #ef4444);
      font-size: 0.8rem;
      margin-top: 0.3rem;
    }
  `]
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  credentials = { username: '', password: '' };
  confirmPassword = '';
  isLoading = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    this.isLoading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Invalid username or password. Please try again.';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}

