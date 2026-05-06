import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatorService } from '../services/operator.service';
import { TelecomOperator, RechargePlan } from '../models';

@Component({
  selector: 'app-admin-operators',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <h1>Operators & Plans</h1>
        <button class="btn btn-primary" (click)="showOperatorModal = true">
          + Add Operator
        </button>
      </div>

      <div class="card" *ngIf="isLoading" style="text-align: center; padding: 3rem;">
        <p>Loading operators...</p>
      </div>

      <div class="dashboard-grid">
        <div class="card relative" *ngFor="let op of operators">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center gap-2">
              <h3 style="margin: 0;">{{ op.name }}</h3>
              <span class="status-badge status-success" *ngIf="op.plans && op.plans.length > 0">Active</span>
              <span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: var(--error);" *ngIf="!op.plans || op.plans.length === 0">Inactive</span>
            </div>
            <button class="delete-btn" style="position: static;" (click)="deleteOperator(op.id)" title="Delete Operator">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
          <p class="text-muted mb-4">Region: {{ op.region }}</p>

          <h4 class="mb-2">Available Plans ({{ op.plans?.length || 0 }})</h4>
          <div style="max-height: 200px; overflow-y: auto; padding-right: 10px;">
            <div *ngIf="!op.plans?.length" class="text-muted mb-2 text-center" style="font-size: 0.85rem; margin-top: 1rem;">
              No plans available
            </div>
            <div *ngFor="let plan of op.plans" class="mb-2 plan-card flex items-center justify-between" style="gap: 12px;">
              <div style="flex: 1; min-width: 0;">
                <div class="flex justify-between items-center mb-1">
                  <span style="font-weight: 600; font-size: 0.95rem;">{{ plan.planName }}</span>
                  <span class="text-primary" style="font-weight: 700; font-size: 1rem;">₹{{ plan.price }}</span>
                </div>
                <div class="flex justify-between items-center" style="font-size: 0.8rem; color: var(--text-muted);">
                  <span>{{ plan.dataBenefits }}</span>
                  <span>{{ plan.validityDays }} Days</span>
                </div>
              </div>
              <button class="delete-btn delete-plan-btn" style="position: static; flex-shrink: 0; opacity: 1;" (click)="deletePlan(plan.id)" title="Delete Plan">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>

          <button class="btn btn-secondary mt-3" style="width: 100%;" (click)="openAddPlanModal(op.id)">
            + Add Plan
          </button>
        </div>
      </div>
    </div>

    <!-- Add Operator Modal -->
    <div class="modal-backdrop" *ngIf="showOperatorModal">
      <div class="modal-content animate-fade-in">
        <h2>Add Operator</h2>
        <div class="input-group">
          <label>Operator Name</label>
          <input type="text" class="input-control" [(ngModel)]="newOperator.name" placeholder="e.g. Jio">
        </div>
        <div class="input-group">
          <label>Region</label>
          <input type="text" class="input-control" [(ngModel)]="newOperator.region" placeholder="e.g. India">
        </div>
        <div class="input-group" style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="activeCb" [(ngModel)]="newOperator.active" style="width: 18px; height: 18px;">
          <label for="activeCb" style="margin: 0; cursor: pointer;">Is Active?</label>
        </div>

        <div class="flex justify-end mt-4" style="gap: 1rem;">
          <button class="btn btn-secondary" (click)="showOperatorModal = false">Cancel</button>
          <button class="btn btn-primary" (click)="addOperator()" [disabled]="!newOperator.name || isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save Operator' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Plan Modal -->
    <div class="modal-backdrop" *ngIf="showPlanModal">
      <div class="modal-content animate-fade-in" style="max-width: 500px;">
        <h2>Add Plan to {{ getOperatorName(selectedOperatorId) }}</h2>
        <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0;">
          <div class="input-group">
            <label>Plan Name</label>
            <input type="text" class="input-control" [(ngModel)]="newPlan.planName" placeholder="e.g. Unlimited 5G">
          </div>
          <div class="input-group">
            <label>Price (₹)</label>
            <input type="number" class="input-control" [(ngModel)]="newPlan.price" placeholder="299">
          </div>
          <div class="input-group">
            <label>Data Benefits</label>
            <input type="text" class="input-control" [(ngModel)]="newPlan.dataBenefits" placeholder="2GB/Day">
          </div>
          <div class="input-group">
            <label>Validity (Days)</label>
            <input type="number" class="input-control" [(ngModel)]="newPlan.validityDays" placeholder="28">
          </div>
        </div>
        <div class="input-group mt-3">
          <label>Description</label>
          <input type="text" class="input-control" [(ngModel)]="newPlan.description" placeholder="Includes 100 SMS/Day">
        </div>

        <div class="flex justify-end mt-4" style="gap: 1rem;">
          <button class="btn btn-secondary" (click)="showPlanModal = false">Cancel</button>
          <button class="btn btn-primary" (click)="addPlan()" [disabled]="!newPlan.planName || !newPlan.price || isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save Plan' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .status-success {
      background: rgba(16, 44, 185, 0.1);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .relative {
      position: relative;
    }
    .delete-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .delete-btn:hover {
      background: var(--error);
      color: white;
    }
    .plan-card {
      background: rgba(128, 155, 215, 0.78);
      border-radius: 8px;
      border: 1px solid var(--border);
      transition: all 0.2s ease;
      padding: 12px;
    }
    .plan-card:hover {
      background: rgba(127, 161, 214, 0.6);
      border-color: rgba(99, 102, 241, 0.3);
    }
    .delete-plan-btn {
      width: 28px;
      height: 28px;
      background: rgba(239, 68, 68, 0.05);
    }
    .delete-plan-btn:hover {
      background: var(--error);
      color: white;
    }
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-content {
      background: var(--surface);
      padding: 2rem;
      border-radius: 16px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      border: 1px solid var(--border);
    }
  `]
})
export class AdminOperatorsPage implements OnInit {
  private operatorService = inject(OperatorService);
  operators: TelecomOperator[] = [];
  isLoading = true;
  isSubmitting = false;

  // Modal State
  showOperatorModal = false;
  showPlanModal = false;
  selectedOperatorId = 0;

  // Form Models
  newOperator: Partial<TelecomOperator> = { name: '', region: 'India', active: true };
  newPlan: Partial<RechargePlan> = { planName: '', price: null as any, dataBenefits: '', validityDays: null as any, description: '' };

  ngOnInit() {
    this.loadOperators();
  }

  loadOperators() {
    this.isLoading = true;
    this.operatorService.getOperators().subscribe({
      next: (data) => {
        this.operators = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load operators', err);
        this.isLoading = false;
      }
    });
  }

  getOperatorName(id: number): string {
    return this.operators.find(o => o.id === id)?.name || '';
  }

  openAddPlanModal(operatorId: number) {
    this.selectedOperatorId = operatorId;
    this.newPlan = { planName: '', price: null as any, dataBenefits: '', validityDays: null as any, description: '' };
    this.showPlanModal = true;
  }

  addOperator() {
    this.isSubmitting = true;
    this.operatorService.createOperator(this.newOperator).subscribe({
      next: () => {
        this.showOperatorModal = false;
        this.newOperator = { name: '', region: 'India', active: true };
        this.isSubmitting = false;
        this.loadOperators();
      },
      error: (err) => {
        console.error('Error creating operator', err);
        this.isSubmitting = false;
        alert('Failed to add operator');
      }
    });
  }

  deleteOperator(id: number) {
    if(confirm('Are you sure you want to delete this operator and all its plans?')) {
      this.operatorService.deleteOperator(id).subscribe({
        next: () => this.loadOperators(),
        error: (err) => { console.error(err); alert('Failed to delete operator'); }
      });
    }
  }

  addPlan() {
    this.isSubmitting = true;
    this.operatorService.createPlan(this.selectedOperatorId, this.newPlan).subscribe({
      next: () => {
        this.showPlanModal = false;
        this.isSubmitting = false;
        this.loadOperators();
      },
      error: (err) => {
        console.error('Error creating plan', err);
        this.isSubmitting = false;
        alert('Failed to add plan: ' + (err.message || JSON.stringify(err)));
      }
    });
  }

  deletePlan(planId: number) {
    if(confirm('Are you sure you want to delete this plan?')) {
      this.operatorService.deletePlan(planId).subscribe({
        next: () => this.loadOperators(),
        error: (err) => { console.error(err); alert('Failed to delete plan'); }
      });
    }
  }
}
