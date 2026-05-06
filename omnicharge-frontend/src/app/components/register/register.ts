import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="container flex justify-center items-center animate-fade-in" style="min-height: calc(100vh - 150px); padding-top: 2rem; padding-bottom: 2rem;">
      <div class="card auth-card">
        <div class="text-center mb-4">
          <h2>Create Account</h2>
          <p>Join Omnicharge today</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="input-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" class="input-control" 
                   [(ngModel)]="user.username" required placeholder="Choose a username">
          </div>

          <div class="input-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" class="input-control" 
                   [(ngModel)]="user.email" required placeholder="Enter your email">
          </div>

          <div class="input-group">
            <label for="phoneNumber">Mobile Number</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" class="input-control" 
                   [(ngModel)]="user.phoneNumber" required placeholder="Enter mobile number">
          </div>

          <div class="input-group">
            <label for="password">Password</label>
            <div style="position: relative;">
              <input [type]="showPassword ? 'text' : 'password'" id="password" name="password" class="input-control" 
                     [(ngModel)]="user.password" required placeholder="Create a password"
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
                     style="padding-right: 40px;" #confirmPwdModel="ngModel">
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
            <div *ngIf="confirmPwdModel.touched && confirmPassword !== user.password" style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem;">
              Passwords do not match.
            </div>
          </div>

          <div *ngIf="error" class="error-box mb-3">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary mt-2" style="width: 100%;" [disabled]="!registerForm.form.valid || isLoading || user.password !== confirmPassword">
            <span *ngIf="isLoading">Creating account...</span>
            <span *ngIf="!isLoading">Register</span>
          </button>
        </form>

        <div class="text-center mt-4" style="font-size: 0.9rem;">
          <span style="color: var(--text-muted);">Already have an account?</span>
          <a routerLink="/login" class="text-primary" style="text-decoration: none; font-weight: 500; margin-left: 0.5rem;">Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      width: 100%;
      max-width: 450px;
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
  `]
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: User = { username: '', email: '', phoneNumber: '', password: '' };
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

    this.authService.register(this.user).subscribe({
      next: () => {
        // Auto login after register
        this.authService.login({ username: this.user.username, password: this.user.password }).subscribe({
          next: () => {
            this.isLoading = false;
            this.cdr.markForCheck();
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.isLoading = false;
            this.cdr.markForCheck();
            this.router.navigate(['/login']); // Fallback to login
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        
        // Show actual error instead of hardcoded string
        if (err.status === 0) {
          this.error = 'Network Error: Cannot connect to the server. Please ensure the backend is running.';
        } else if (err.status === 403) {
          this.error = 'CORS Error: Request blocked by API Gateway.';
        } else if (err.error && typeof err.error === 'string') {
          this.error = err.error;
        } else if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Registration failed: ' + (err.message || 'Unknown error');
        }
        
        this.cdr.markForCheck();
        console.error('Registration error payload:', err);
      }
    });
  }
}
