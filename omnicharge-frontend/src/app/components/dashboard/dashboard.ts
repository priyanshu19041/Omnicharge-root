import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RechargeService } from '../../services/recharge.service';
import { OperatorService } from '../../services/operator.service';
import { RechargeRequest, AuthResponse, TelecomOperator, RechargePlan } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private rechargeService = inject(RechargeService);
  private operatorService = inject(OperatorService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: AuthResponse | null = null;
  recharges: RechargeRequest[] = [];
  operators: TelecomOperator[] = [];
  allPlans: Map<number, RechargePlan> = new Map();
  popularPlans: RechargePlan[] = [];
  selectedRecharge: RechargeRequest | null = null;
  currentActivePlan: { recharge: RechargeRequest; plan: RechargePlan | null; daysLeft: number } | null = null;

  isLoading = true;

  // Recharge form
  mobileNumber = '';
  selectedOperatorId: number | null = null;
  amount = '';

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadRecharges(this.currentUser.userId);
    }
    this.loadOperators();
  }

  loadOperators() {
    this.operatorService.getOperators().subscribe({
      next: (data) => {
        this.operators = data || [];
        // Build a flat map of all plans for validity lookup
        this.operators.forEach(op => (op.plans || []).forEach(p => this.allPlans.set(p.id, p)));
        if (this.operators.length > 0) {
          this.selectedOperatorId = this.operators[0].id;
          this.loadPopularPlans(this.operators[0].id);
        }
        // Recompute active plan now that we have plan data
        const ok = (this.recharges || []).filter(r => r?.status === 'SUCCESS');
        if (ok.length) this.computeActivePlan(ok);
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  loadRecharges(userId: number, attempt = 1) {
    this.rechargeService.getUserRecharges(userId).subscribe({
      next: (data) => {
        this.recharges = Array.isArray(data) ? data.sort((a, b) => (b.id || 0) - (a.id || 0)) : [];
        const ok = this.recharges.filter(r => r?.status === 'SUCCESS');
        this.computeActivePlan(ok);
        if (this.recharges.length > 0 && this.recharges[0]?.status === 'PENDING' && attempt < 3) {
          setTimeout(() => this.loadRecharges(userId, attempt + 1), 1500);
        } else { this.isLoading = false; }
        this.cdr.markForCheck();
      },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  computeActivePlan(successRecharges: RechargeRequest[]) {
    const today = new Date();
    this.currentActivePlan = null;

    // successful recharges are already sorted descending by id/date
    for (const r of successRecharges) {
      const plan = this.allPlans.get(r.planId) || null;
      const validity = plan?.validityDays ?? 28;
      const rechargeDate = r.requestDate ? new Date(r.requestDate) : new Date();
      const expiryDate = new Date(rechargeDate);
      expiryDate.setDate(expiryDate.getDate() + validity);
      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0) {
        this.currentActivePlan = { recharge: r, plan, daysLeft };
        break; // Only pick the latest active one
      }
    }
  }

  loadPopularPlans(operatorId: number) {
    this.operatorService.getPlansByOperator(operatorId).subscribe({
      next: (plans) => { this.popularPlans = plans.slice(0, 4); this.cdr.markForCheck(); },
      error: () => this.cdr.markForCheck()
    });
  }

  onOperatorChange() {
    if (this.selectedOperatorId) this.loadPopularPlans(+this.selectedOperatorId);
  }

  setAmount(val: number) { this.amount = val.toString(); }

  goRecharge() { this.router.navigate(['/recharge']); }

  selectPlan(_plan: RechargePlan) { this.router.navigate(['/recharge']); }

  logout() { this.authService.logout(); this.router.navigate(['/login']); }

  get selectedOperatorName(): string {
    const op = this.operators.find(o => o.id === +this.selectedOperatorId!);
    return op ? op.name : '';
  }

  viewTransaction(recharge: RechargeRequest) {
    this.selectedRecharge = recharge;
  }

  closeModal() {
    this.selectedRecharge = null;
  }
}
