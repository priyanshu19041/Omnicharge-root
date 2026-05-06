import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { User } from '../models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <h1 class="mb-4">User Management</h1>
      
      <div class="card" *ngIf="isLoading" style="text-align: center; padding: 3rem;">
        <p>Loading users...</p>
      </div>

      <div class="table-container card" *ngIf="!isLoading && users.length > 0" style="padding: 0; overflow: hidden;">
        <table class="history-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: rgba(15, 23, 42, 0.4); text-align: left;">
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">ID</th>
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">Username</th>
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">Email</th>
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users" style="border-bottom: 1px solid rgba(51, 65, 85, 0.3);">
              <td style="padding: 1.25rem 1.5rem;">{{ u.id }}</td>
              <td style="padding: 1.25rem 1.5rem; font-weight: 500;">{{ u.username }}</td>
              <td style="padding: 1.25rem 1.5rem;">{{ u.email }}</td>
              <td style="padding: 1.25rem 1.5rem;">{{ u.phoneNumber }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminUsersPage implements OnInit {
  private authService = inject(AuthService);
  users: User[] = [];
  isLoading = true;

  ngOnInit() {
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading = false;
      }
    });
  }
}
