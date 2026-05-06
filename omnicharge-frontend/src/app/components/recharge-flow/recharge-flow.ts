import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OperatorService } from '../../services/operator.service';
import { RechargeService } from '../../services/recharge.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { TelecomOperator, RechargePlan, RechargeRequest, PaymentTransaction } from '../../models';

declare var Razorpay: any;

@Component({
  selector: 'app-recharge-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container animate-fade-in" style="padding-top: 2rem; max-width: 800px;">
      <div class="text-center mb-4">
        <h1 class="mb-1">Recharge Mobile</h1>
        <p>Complete your recharge in 3 simple steps</p>
      </div>

      <!-- Stepper -->
      <div class="stepper flex justify-between mb-4 card" style="padding: 1rem 2rem;">
        <div class="step" [class.active]="step >= 1">
          <div class="step-circle">1</div>
          <span>Operator</span>
        </div>
        <div class="step-line" [class.active]="step >= 2"></div>
        <div class="step" [class.active]="step >= 2">
          <div class="step-circle">2</div>
          <span>Plan</span>
        </div>
        <div class="step-line" [class.active]="step >= 3"></div>
        <div class="step" [class.active]="step >= 3">
          <div class="step-circle">3</div>
          <span>Payment</span>
        </div>
      </div>

      <!-- Step 1: Select Operator & Mobile Number -->
      <div *ngIf="step === 1" class="card animate-fade-in">
        <h3 class="mb-3">Enter Details</h3>
        
        <div class="input-group">
          <div class="flex justify-between items-center">
            <label for="mobile">Mobile Number</label>
            <button class="btn btn-sm text-primary" style="background:none; border:none; padding:0; font-size:0.85rem;" (click)="rechargeForSelf()">
              Recharge for Self
            </button>
          </div>
          <input type="tel" id="mobile" class="input-control" [(ngModel)]="mobileNumber" 
                 (ngModelChange)="onMobileNumberChange()"
                 placeholder="10-digit mobile number" maxlength="10">
          <small class="text-muted mt-2 block">You can recharge any mobile number.</small>
        </div>

        <div class="input-group mt-4">
          <label>Select Telecom Operator</label>
          <div *ngIf="isLoadingOperators" class="text-muted">Loading operators...</div>
          
          <div class="operator-grid mt-2" *ngIf="!isLoadingOperators">
            <div *ngFor="let op of operators" 
                 class="operator-card" 
                 [class.selected]="selectedOperator?.id === op.id"
                 (click)="selectOperator(op)">
              <div class="op-icon">📱</div>
              <div class="op-name">{{ op.name }}</div>
              <div class="op-region">{{ op.region }}</div>
              <div class="mt-2">
                <span class="status-badge status-success" *ngIf="op.plans && op.plans.length > 0">Active</span>
                <span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: var(--error);" *ngIf="!op.plans || op.plans.length === 0">Inactive</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between mt-4">
          <button routerLink="/dashboard" class="btn btn-secondary">Cancel</button>
          <button class="btn btn-primary" [disabled]="!mobileNumber || mobileNumber.length < 10 || !selectedOperator" 
                  (click)="goToStep(2)">Continue to Plans</button>
        </div>
      </div>

      <!-- Step 2: Select Plan -->
      <div *ngIf="step === 2" class="animate-fade-in">
        <div class="flex justify-between items-center mb-3">
          <h3>Select Plan for {{ selectedOperator?.name }}</h3>
          <span class="badge">{{ mobileNumber }}</span>
        </div>
        
        <div *ngIf="isLoadingPlans" class="card text-center">Loading plans...</div>
        
        <div class="plans-list" *ngIf="!isLoadingPlans">
          <div *ngFor="let plan of plans" class="card plan-card flex justify-between items-center mb-3">
            <div>
              <div class="plan-price">{{ plan.price | currency:'INR':'symbol':'1.0-0' }}</div>
              <div class="plan-name">{{ plan.planName }}</div>
              <div class="plan-benefits text-muted">{{ plan.dataBenefits }} • {{ plan.validityDays }} Days Validity</div>
            </div>
            <button class="btn btn-secondary select-btn" (click)="selectPlan(plan)">Select</button>
          </div>
          
          <div *ngIf="plans.length === 0" class="card text-center text-muted">
            No plans available for this operator.
          </div>
        </div>

        <div class="mt-4">
          <button class="btn btn-secondary" (click)="goToStep(1)">Back</button>
        </div>
      </div>

      <!-- Step 3: Payment -->
      <div *ngIf="step === 3" class="animate-fade-in">
        <div class="card mb-4" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(16, 185, 129, 0.1)); border-color: var(--primary);">
          <h3 class="mb-3">Order Summary</h3>
          <div class="flex justify-between mb-2">
            <span class="text-muted">Mobile Number</span>
            <span style="font-weight: 500;">{{ mobileNumber }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-muted">Operator</span>
            <span style="font-weight: 500;">{{ selectedOperator?.name }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-muted">Plan</span>
            <span style="font-weight: 500;">{{ selectedPlan?.planName }}</span>
          </div>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 1rem 0;">
          <div class="flex justify-between items-center">
            <span style="font-size: 1.2rem; font-weight: 500;">Total Amount</span>
            <span class="text-primary" style="font-size: 1.5rem; font-weight: 700;">{{ selectedPlan?.price | currency:'INR':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <div class="card payment-methods text-center">
          <div class="upi-icon mb-3">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </div>
          <h3 class="mb-2">Pay Securely via UPI</h3>
          <p class="text-muted mb-4" style="font-size: 0.95rem;">
            Click below to generate a QR code. Scan the code using Google Pay, PhonePe, Paytm, or any UPI app to complete your recharge.
          </p>
          
          <div class="payment-note mb-4 p-3" style="background: rgba(79, 70, 229, 0.1); border-radius: 8px; border: 1px solid rgba(79, 70, 229, 0.2);">
            <span style="font-size: 0.85rem; color: var(--text-muted);">
              <strong style="color: var(--primary);">Note:</strong> After completing the payment, please wait while we verify the transaction.
            </span>
          </div>
          
          <div *ngIf="error" class="error-box mb-3">{{ error }}</div>

          <div class="flex justify-between mt-2">
            <button class="btn btn-secondary" (click)="goToStep(2)" [disabled]="isProcessing">Back</button>
            <button class="btn btn-primary" style="padding-left: 2rem; padding-right: 2rem;" 
                    [disabled]="isProcessing" (click)="processRecharge()">
              <span *ngIf="isProcessing">Opening Secure Gateway...</span>
              <span *ngIf="!isProcessing">Generate QR & Pay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stepper {
      align-items: center;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-weight: 500;
      transition: var(--transition);
    }
    .step.active {
      color: var(--primary);
    }
    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--surface-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      transition: var(--transition);
    }
    .step.active .step-circle {
      background: var(--primary);
      color: white;
      box-shadow: var(--glow);
    }
    .step-line {
      flex: 1;
      height: 4px;
      background: var(--surface-hover);
      margin: 0 1rem;
      border-radius: 2px;
      position: relative;
      top: -15px;
      transition: var(--transition);
    }
    .step-line.active {
      background: var(--primary);
    }
    
    .operator-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }
    .operator-card {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: var(--transition);
    }
    .operator-card:hover {
      border-color: var(--primary);
      background: rgba(79, 70, 229, 0.05);
    }
    .operator-card.selected {
      border-color: var(--primary);
      background: rgba(79, 70, 229, 0.1);
      box-shadow: inset 0 0 0 1px var(--primary);
    }
    .op-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .op-name { font-weight: 600; color: var(--text-main); }
    .op-region { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }
    
    .badge {
      background: rgba(255,255,255,0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
    }
    
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
    
    .plan-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }
    .plan-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: var(--primary);
    }
    .plan-benefits {
      font-size: 0.875rem;
    }
    .select-btn {
      border-radius: 20px;
    }
    
    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      background: var(--background);
      transition: var(--transition);
    }
    .radio-label:hover {
      border-color: var(--text-muted);
    }
    .radio-label input:checked + * {
      /* could style */
    }
    .error-box {
      color: var(--error);
      font-size: 0.875rem;
    }
  `]
})
export class RechargeFlow implements OnInit {
  private operatorService = inject(OperatorService);
  private rechargeService = inject(RechargeService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  step = 1;
  
  // Form state
  mobileNumber = '';
  selectedOperator: TelecomOperator | null = null;
  selectedPlan: RechargePlan | null = null;
  paymentMethod = 'UPI';
  
  // Data state
  operators: TelecomOperator[] = [];
  plans: RechargePlan[] = [];
  
  isLoadingOperators = true;
  isLoadingPlans = false;
  isProcessing = false;
  error = '';

  ngOnInit() {
    this.operatorService.getOperators().subscribe({
      next: (data) => {
        this.operators = data;
        this.isLoadingOperators = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingOperators = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectOperator(op: TelecomOperator) {
    this.selectedOperator = op;
  }

  goToStep(newStep: number) {
    if (newStep === 2 && this.selectedOperator) {
      this.loadPlans();
    }
    this.step = newStep;
  }

  onMobileNumberChange() {
    // If the user changes the mobile number after selecting a plan, reset the plan
    if (this.selectedPlan) {
      this.selectedPlan = null;
    }
  }

  rechargeForSelf() {
    const user = this.authService.getCurrentUser();
    if (user && user.userId) {
       // Temporarily show a loading state if needed, or just fetch
       this.authService.getUserById(user.userId).subscribe({
         next: (fullUser) => {
           if (fullUser && fullUser.phoneNumber) {
             this.mobileNumber = fullUser.phoneNumber;
             this.onMobileNumberChange();
             this.cdr.markForCheck();
           } else {
             alert("No mobile number registered to your account.");
           }
         },
         error: () => {
           alert("Failed to fetch your registered mobile number.");
         }
       });
    } else {
       alert("Please log in to use this feature.");
    }
  }

  loadPlans() {
    if (!this.selectedOperator) return;
    this.isLoadingPlans = true;
    this.operatorService.getPlansByOperator(this.selectedOperator.id).subscribe({
      next: (data) => {
        this.plans = data;
        this.isLoadingPlans = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingPlans = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectPlan(plan: RechargePlan) {
    this.selectedPlan = plan;
    this.step = 3;
  }

  processRecharge() {
    const user = this.authService.getCurrentUser();
    if (!user || !this.selectedPlan || !this.selectedOperator) return;

    this.isProcessing = true;
    this.error = '';

    // 1. Initiate Recharge
    const rechargeReq: RechargeRequest = {
      userId: user.userId,
      operatorId: this.selectedOperator.id,
      planId: this.selectedPlan.id,
      mobileNumber: this.mobileNumber,
      amount: this.selectedPlan.price
    };

    this.rechargeService.initiateRecharge(rechargeReq).subscribe({
      next: (savedRecharge) => {
        // 2. Make Payment
        if (!savedRecharge.id) return;
        
        const paymentReq: PaymentTransaction = {
          rechargeId: savedRecharge.id,
          userId: user.userId,
          amount: savedRecharge.amount,
          paymentMethod: this.paymentMethod
        };

        this.paymentService.makePayment(paymentReq).subscribe({
          next: (orderInfo: any) => {
            const options = {
              "key": orderInfo.keyId,
              "amount": orderInfo.amount * 100, 
              "currency": "INR",
              "name": "OmniCharge",
              "description": "Mobile Recharge",
              "order_id": orderInfo.razorpayOrderId,
              "handler": (response: any) => {
                this.paymentService.verifyPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                }).subscribe({
                  next: () => {
                    this.isProcessing = false;
                    this.cdr.markForCheck();
                    this.router.navigate(['/dashboard']);
                  },
                  error: () => {
                    this.isProcessing = false;
                    this.error = 'Payment verification failed.';
                    this.cdr.markForCheck();
                  }
                });
              },
              "prefill": {
                "name": user.username,
                "email": user.username + "@gmail.com",
                "contact": this.mobileNumber
              },
              "notes": {
                "rechargeNumber": this.mobileNumber
              },
              "theme": {
                "color": "#4f46e5"
              }
            };
            const rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', (response: any) => {
              this.isProcessing = false;
              this.error = 'Payment failed: ' + response.error.description;
              this.cdr.markForCheck();
            });
            rzp1.open();
          },
          error: () => {
            this.isProcessing = false;
            this.error = 'Failed to initialize payment.';
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.isProcessing = false;
        
        let errorMsg = 'Failed to initiate recharge. Please try again.';
        if (err.error) {
           if (typeof err.error === 'string') {
              errorMsg = err.error;
           } else if (err.error.message) {
              errorMsg = err.error.message;
           } else if (err.error.error) {
              errorMsg = err.error.error;
           }
        }
        
        this.error = errorMsg;
        this.cdr.markForCheck();
      }
    });
  }
}
