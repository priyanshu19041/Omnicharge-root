import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="hero container animate-fade-in">
      <div class="hero-content">
        <div class="hero-text delay-100">
          <h1 class="hero-title">
            Browse<br>
            Mobile Recharge<br>
            <span class="text-underline">Plans</span>
          </h1>
          <p class="hero-subtitle delay-200">
            Experience lightning-fast transactions, exclusive telecom plans, and a seamless dashboard.
            Join Omnicharge today and never run out of balance.
          </p>
          
          <div class="hero-actions delay-300">
            <a routerLink="/register" class="btn btn-primary hero-btn">Create Free Account</a>
            <a routerLink="/login" class="btn btn-secondary hero-btn">Login to Dashboard</a>
          </div>

          <div class="features-grid delay-300">
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <div>
                <h3>Instant Recharges</h3>
                <p>Process your payments within seconds.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🛡️</div>
              <div>
                <h3>Secure Payments</h3>
                <p>Bank-grade encryption for all transactions.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-image-container delay-200">
          <div class="promo-card">
            <div class="promo-content">
              <h2>Stream, game, scroll <br> <span class="text-accent">with unlimited 5G packs</span></h2>
              <a routerLink="/register" class="btn btn-accent mt-2">Recharge now</a>
            </div>
            <div class="promo-img-wrapper">
              <img src="/person_on_phn.jpg" alt="Stream, game, scroll with unlimited 5G packs" class="promo-img">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popular Plans Section -->
    <div class="container section-padding animate-fade-in delay-300">
      <div class="text-center mb-5">
        <h2 class="section-title">Popular Recharge <span class="text-accent">Plans</span></h2>
        <p class="text-muted">Choose from our most popular 5G enabled prepaid plans</p>
      </div>
      
      <div class="dashboard-grid">
        <!-- Plan 1 -->
        <div class="card plan-card">
          <div class="plan-header">
            <span class="badge badge-accent">Best Value</span>
            <div class="plan-price-large mt-2">₹299</div>
            <div class="plan-name">True 5G Unlimited</div>
          </div>
          <div class="plan-features mt-3">
            <div class="feature-row">
              <span class="feature-icon text-accent">✓</span> <span>2GB/Day Data</span>
            </div>
            <div class="feature-row">
              <span class="feature-icon text-accent">✓</span> <span>28 Days Validity</span>
            </div>
            <div class="feature-row">
              <span class="feature-icon text-accent">✓</span> <span>Unlimited Voice Calls</span>
            </div>
          </div>
          <a routerLink="/login" class="btn btn-secondary w-100 mt-4 text-center">Recharge Now</a>
        </div>
        
        <!-- Plan 2 -->
        <div class="card plan-card" style="border-color: var(--primary); transform: scale(1.05); z-index: 1;">
          <div class="plan-header">
            <span class="badge badge-primary">Most Popular</span>
            <div class="plan-price-large mt-2 text-primary">₹666</div>
            <div class="plan-name">Hero 5G Pack</div>
          </div>
          <div class="plan-features mt-3">
            <div class="feature-row">
              <span class="feature-icon text-primary">✓</span> <span>1.5GB/Day Data</span>
            </div>
            <div class="feature-row">
              <span class="feature-icon text-primary">✓</span> <span>84 Days Validity</span>
            </div>
            <div class="feature-row">
              <span class="feature-icon text-primary">✓</span> <span>Unlimited Voice Calls</span>
            </div>
            <div class="feature-row">
              <span class="feature-icon text-primary">✓</span> <span>Weekend Data Rollover</span>
            </div>
          </div>
          <a routerLink="/login" class="btn btn-primary w-100 mt-4 text-center">Recharge Now</a>
        </div>
        
        <!-- Plan 3 -->
        <div class="card plan-card">
          <div class="plan-header">
            <span class="badge badge-secondary">Entertainment</span>
            <div class="plan-price-large mt-2">₹899</div>
            <div class="plan-name">OTT Premium Pack</div>
          </div>
          <div class="plan-features mt-3">
            <div class="feature-row">
              <span class="feature-icon text-muted">✓</span> <span>3GB/Day Data</span>
            </div>
            <div class="feature-row">
              <span class="feature-icon text-muted">✓</span> <span>90 Days Validity</span>
            </div>
            <div class="feature-row">
              <span class="feature-icon text-muted">✓</span> <span>Free Prime & Hotstar</span>
            </div>
          </div>
          <a routerLink="/login" class="btn btn-secondary w-100 mt-4 text-center">Recharge Now</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-padding {
      padding: 5rem 0;
    }
    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      align-items: center;
    }
    .plan-card {
      padding: 2rem;
      transition: all 0.3s ease;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
    }
    .plan-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border-color: rgba(99, 102, 241, 0.5);
    }
    .plan-header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .badge-accent {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .badge-primary {
      background: rgba(79, 70, 229, 0.1);
      color: var(--primary);
      border: 1px solid rgba(79, 70, 229, 0.2);
    }
    .badge-secondary {
      background: rgba(100, 116, 139, 0.1);
      color: var(--text-muted);
      border: 1px solid rgba(100, 116, 139, 0.2);
    }
    .plan-price-large {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1;
      color: var(--text-main);
    }
    .plan-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }
    .plan-features {
      flex: 1;
    }
    .feature-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.95rem;
      color: var(--text-main);
    }
    .feature-icon {
      font-weight: bold;
    }
    .w-100 {
      width: 100%;
    }
    .text-center {
      text-align: center;
    }
    
    .hero {
      padding: 4rem 0;
      min-height: calc(100vh - 70px);
      display: flex;
      align-items: center;
    }
    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      width: 100%;
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      letter-spacing: -1.5px;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      color: var(--text-main);
    }
    .text-underline {
      position: relative;
      display: inline-block;
    }
    .text-underline::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 6px;
      background-color: var(--accent);
      border-radius: 4px;
    }
    .hero-subtitle {
      font-size: 1.125rem;
      max-width: 500px;
      margin-bottom: 2.5rem;
      color: var(--text-muted);
    }
    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 3rem;
    }
    .hero-btn {
      padding: 0.875rem 1.75rem;
      font-size: 1rem;
    }
    .features-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .feature-icon {
      font-size: 1.5rem;
      background: var(--surface);
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }
    .feature-item h3 {
      font-size: 1.125rem;
      margin-bottom: 0.25rem;
      color: var(--text-main);
    }
    .feature-item p {
      margin-bottom: 0;
      font-size: 0.9rem;
    }
    
    /* Promo Card Styles */
    .hero-image-container {
      display: flex;
      justify-content: flex-end;
    }
    .promo-card {
      background: var(--surface);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
      max-width: 420px;
      width: 100%;
      transition: var(--transition);
      display: flex;
      flex-direction: column;
    }
    .promo-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .promo-content {
      padding: 2.5rem 2.5rem 1.5rem 2.5rem;
      text-align: left;
    }
    .promo-content h2 {
      font-size: 1.75rem;
      line-height: 1.2;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    .promo-img-wrapper {
      width: 100%;
      height: 380px;
      overflow: hidden;
    }
    .promo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    
    @media (max-width: 992px) {
      .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 3rem;
      }
      .hero-subtitle {
        margin: 0 auto 2.5rem auto;
      }
      .hero-actions {
        justify-content: center;
      }
      .text-underline::after {
        left: 50%;
        transform: translateX(-50%);
      }
      .features-grid {
        align-items: center;
        text-align: left;
        max-width: 400px;
        margin: 0 auto;
      }
      .hero-image-container {
        justify-content: center;
        margin-top: 2rem;
      }
    }
  `]
})
export class Home {
}

