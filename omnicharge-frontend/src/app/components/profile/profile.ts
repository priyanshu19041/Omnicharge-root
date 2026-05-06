import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container animate-fade-in" style="padding-top: 2rem; max-width: 600px;">
      <h1 class="mb-4">My Profile</h1>
      
      <div class="card" *ngIf="isLoading" style="text-align: center; padding: 3rem;">
        <p>Loading profile details...</p>
      </div>

      <div class="card" *ngIf="!isLoading && user">
        <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
          <div class="input-group mb-3">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" class="input-control" 
                   [(ngModel)]="user.username" required minlength="3">
          </div>
          
          <div class="input-group mb-3">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" class="input-control" 
                   [(ngModel)]="user.email" required email>
          </div>
          
          <div class="input-group mb-4">
            <label for="phoneNumber">Phone Number</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" class="input-control" 
                   [(ngModel)]="user.phoneNumber" required minlength="10" maxlength="10">
          </div>

          <hr style="border: 1px solid var(--border); margin: 2rem 0;">
          <h3 class="mb-3">Change Password <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">(Optional)</span></h3>

          <div class="input-group mb-3">
            <label for="password">New Password</label>
            <div style="position: relative;">
              <input [type]="showPassword ? 'text' : 'password'" id="password" name="password" class="input-control" 
                     [(ngModel)]="newPassword" placeholder="Enter new password"
                     style="padding-right: 40px;">
              <button type="button" (click)="togglePassword('new')" 
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

          <div class="input-group mb-4">
            <label for="confirmPassword">Confirm New Password</label>
            <div style="position: relative;">
              <input [type]="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" name="confirmPassword" class="input-control" 
                     [(ngModel)]="confirmPassword" placeholder="Confirm new password"
                     style="padding-right: 40px;">
              <button type="button" (click)="togglePassword('confirm')" 
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
            <div *ngIf="newPassword && confirmPassword && newPassword !== confirmPassword" class="text-error mt-1" style="font-size: 0.8rem; color: var(--error);">
              Passwords do not match!
            </div>
          </div>

          <div *ngIf="successMessage" class="status-badge status-success mb-3 p-2 text-center" style="display: block;">
            {{ successMessage }}
          </div>

          <div *ngIf="errorMessage" class="error-box mb-3 text-center">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;" 
                  [disabled]="!profileForm.form.valid || isSaving || !hasChanges() || (newPassword !== confirmPassword)">
            <span *ngIf="isSaving">Saving Changes...</span>
            <span *ngIf="!isSaving">Save Profile</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .status-success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .error-box {
      color: var(--error);
      background: rgba(239, 68, 68, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
  `]
})
export class Profile implements OnInit {
  private authService = inject(AuthService);

  user: User | null = null;
  originalUser: User | null = null;
  
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.userId) {
      this.authService.getUserById(currentUser.userId).subscribe({
        next: (data) => {
          this.user = { ...data };
          this.originalUser = { ...data };
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load profile details.';
          this.isLoading = false;
          console.error(err);
        }
      });
    } else {
      this.errorMessage = 'User session not found.';
      this.isLoading = false;
    }
  }

  togglePassword(field: 'new' | 'confirm') {
    if (field === 'new') this.showPassword = !this.showPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  hasChanges(): boolean {
    if (!this.user || !this.originalUser) return false;
    const hasBasicChanges = this.user.username !== this.originalUser.username ||
           this.user.email !== this.originalUser.email ||
           this.user.phoneNumber !== this.originalUser.phoneNumber;
    const hasPasswordChange = this.newPassword.length > 0;
    return hasBasicChanges || hasPasswordChange;
  }

  updateProfile() {
    if (!this.user || !this.user.id) return;
    if (this.newPassword !== this.confirmPassword) return;
    
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updatePayload: Partial<User> = {
      username: this.user.username,
      email: this.user.email,
      phoneNumber: this.user.phoneNumber
    };

    if (this.newPassword) {
      updatePayload.password = this.newPassword;
    }

    this.authService.updateUser(this.user.id, updatePayload).subscribe({
      next: (updatedUser) => {
        this.user = { ...updatedUser };
        this.originalUser = { ...updatedUser };
        this.newPassword = '';
        this.confirmPassword = '';
        this.successMessage = 'Profile updated successfully!';
        this.isSaving = false;
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.isSaving = false;
        console.error(err);
      }
    });
  }
}
