import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CmoFacade } from '../../../core/facades/cmo.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-cmo-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container page-wrapper">
      <div class="page-header animate-fade-in-up">
        <div>
          <h1 class="page-header__title">Dashboard CMO</h1>
          <p class="page-header__subtitle">
            Selamat datang, <strong>{{ auth.userName() }}</strong> — {{ auth.userNip() }}
          </p>
        </div>
      </div>

      <div class="grid grid--3" style="margin-bottom: 24px;">
        <div class="stat-card animate-fade-in-up" style="animation-delay: 0.1s">
          <div class="stat-card__value">{{ facade.customerCount() }}</div>
          <div class="stat-card__label">Total Customer</div>
        </div>

        <a routerLink="/cmo/upload" class="stat-card stat-card--link animate-fade-in-up" style="animation-delay: 0.2s">
          <div class="stat-card__value" style="font-size: 1.1rem;">Upload Dokumen</div>
          <div class="stat-card__label">Upload All / Bulk Upload</div>
        </a>

        <a routerLink="/cmo/customers" class="stat-card stat-card--link animate-fade-in-up" style="animation-delay: 0.3s">
          <div class="stat-card__value" style="font-size: 1.1rem;">Kelola Customer</div>
          <div class="stat-card__label">Buat & Lihat Customer</div>
        </a>
      </div>

      <div class="card animate-fade-in-up" style="animation-delay: 0.4s">
        <div class="card__header">
          <h2 class="card__title">Daftar Customer Terakhir</h2>
          <a routerLink="/cmo/customers" class="btn btn--secondary btn--sm">Lihat Semua</a>
        </div>
        <div class="card__body" style="padding: 0;">
          @if (facade.isLoading()) {
            <div class="loading-overlay">
              <span class="spinner spinner--lg"></span>
              <p>Memuat data customer...</p>
            </div>
          } @else if (facade.customers().length === 0) {
            <div class="empty-state">
              <h3 class="empty-state__title">Belum ada customer</h3>
              <p class="empty-state__desc">Buat customer baru untuk memulai upload dokumen.</p>
              <a routerLink="/cmo/customers" class="btn btn--primary" style="margin-top: 12px;">
                + Buat Customer
              </a>
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>No. Kontrak</th>
                  <th>Nama</th>
                  <th>Status Fraud</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                @for (c of facade.customers().slice(0, 5); track c.id) {
                  <tr>
                    <td><code style="font-family: var(--font-mono); font-size: 0.8rem;">{{ c.no_contract }}</code></td>
                    <td><strong>{{ c.name }}</strong></td>
                    <td>
                      @switch (c.fraud_status) {
                        @case ('FLAGGED') { <span class="badge badge--danger">Flagged</span> }
                        @case ('CONFIRMED_FRAUD') { <span class="badge badge--danger">Fraud</span> }
                        @case ('CLEAN') { <span class="badge badge--success">Clean</span> }
                        @default { <span class="badge badge--neutral">Pending</span> }
                      }
                    </td>
                    <td>
                      <a routerLink="/cmo/upload" [queryParams]="{customerId: c.id, customerName: c.name}" class="btn btn--secondary btn--sm">
                        Upload
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;

      &__title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text);
      }

      &__subtitle {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin-top: 2px;
      }
    }

    .stat-card--link {
      text-decoration: none;
      color: inherit;
      cursor: pointer;

      &:hover {
        box-shadow: var(--shadow-md);
      }
    }
  `],
})
export class CmoDashboardPage implements OnInit {
  readonly facade = inject(CmoFacade);
  readonly auth = inject(AuthFacade);

  ngOnInit(): void {
    this.facade.loadCustomers();
    this.facade.loadProfile();
  }
}
