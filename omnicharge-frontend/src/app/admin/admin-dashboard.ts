import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <h1 class="mb-2">Admin Dashboard</h1>
      <p class="mb-4 text-muted">Welcome to the OmniCharge Admin Panel. Select a module below to manage the platform.</p>
      
      <div class="dashboard-grid mt-4 mb-4">
        <a routerLink="/admin/users" class="card stat-card interactive-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">👥</div>
          <div>
            <h3 class="stat-value">System Users</h3>
            <p class="stat-label">Manage user accounts</p>
          </div>
        </a>
        
        <a routerLink="/admin/operators" class="card stat-card interactive-card">
          <div class="stat-icon" style="background: rgba(79, 70, 229, 0.1); color: var(--primary);">📶</div>
          <div>
            <h3 class="stat-value">Operators & Plans</h3>
            <p class="stat-label">Manage telecom services</p>
          </div>
        </a>

        <a routerLink="/admin/transactions" class="card stat-card interactive-card">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">💳</div>
          <div>
            <h3 class="stat-value">All Transactions</h3>
            <p class="stat-label">Monitor system payments</p>
          </div>
        </a>
      </div>
      
      <div class="card p-4 mt-4" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(16, 185, 129, 0.05)); border-color: rgba(79, 70, 229, 0.2);">
        <div class="flex items-center gap-4">
          <div style="font-size: 3rem;">⚡</div>
          <div>
            <h3 class="mb-1">Platform Operations</h3>
            <p style="margin: 0; color: var(--text-muted);">As an administrator, you have full control over the OmniCharge platform. Any changes you make to Operators and Plans will instantly reflect in the user recharge flow.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem;
      text-decoration: none;
    }
    .interactive-card {
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .interactive-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.3);
      border-color: rgba(79, 70, 229, 0.5);
    }
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
    }
    .stat-value {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
      color: var(--text-main);
    }
    .stat-label {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-muted);
    }
  `]
})
export class AdminDashboard implements OnInit {
  ngOnInit() {}
}
