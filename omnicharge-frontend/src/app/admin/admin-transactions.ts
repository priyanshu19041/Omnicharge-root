import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RechargeService } from '../services/recharge.service';
import { RechargeRequest } from '../models';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <h1 class="mb-4">Global Transactions</h1>
      
      <div class="card" *ngIf="isLoading" style="text-align: center; padding: 3rem;">
        <p>Loading transactions...</p>
      </div>

      <div class="table-container card" *ngIf="!isLoading && recharges.length > 0" style="padding: 0; overflow: hidden;">
        <table class="history-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: rgba(15, 23, 42, 0.4); text-align: left;">
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">Txn ID</th>
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">User ID</th>
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">Mobile</th>
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">Amount</th>
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">Date</th>
              <th style="padding: 1rem 1.5rem; color: var(--text-muted);">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of recharges" style="border-bottom: 1px solid rgba(51, 65, 85, 0.3);">
              <td style="padding: 1.25rem 1.5rem;">{{ r.id }}</td>
              <td style="padding: 1.25rem 1.5rem;">{{ r.userId }}</td>
              <td style="padding: 1.25rem 1.5rem; font-weight: 500;">{{ r.mobileNumber }}</td>
              <td style="padding: 1.25rem 1.5rem; font-weight: 700; color: var(--primary);">₹{{ r.amount }}</td>
              <td style="padding: 1.25rem 1.5rem; color: var(--text-muted);">{{ r.requestDate | date:'medium' }}</td>
              <td style="padding: 1.25rem 1.5rem;">
                <span class="status-badge" 
                      [ngClass]="{
                        'status-success': r.status === 'SUCCESS',
                        'status-pending': r.status === 'PENDING',
                        'status-failed': r.status === 'FAILED'
                      }">
                  {{ r.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .status-success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .status-pending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    .status-failed {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
  `]
})
export class AdminTransactionsPage implements OnInit {
  private rechargeService = inject(RechargeService);
  recharges: RechargeRequest[] = [];
  isLoading = true;

  ngOnInit() {
    this.rechargeService.getAllRecharges().subscribe({
      next: (data) => {
        // Sort newest first
        this.recharges = data.sort((a, b) => {
          return new Date(b.requestDate || 0).getTime() - new Date(a.requestDate || 0).getTime();
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
        this.isLoading = false;
      }
    });
  }
}
