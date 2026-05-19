import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { BmFacade } from '../../../core/facades/bm.facade';

@Component({
  selector: 'app-bm-cmo-customers',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="container page-wrapper">
      @if (facade.isLoading() && !facade.cmoCustomersData()) {
        <div class="loading-overlay"><span class="spinner spinner--lg"></span><p>Memuat data customer...</p></div>
      } @else if (facade.cmoCustomersData(); as data) {
        <div class="page-header animate-fade-in-up">
          <div>
            <h1>Customer milik {{ data.cmo.name }}</h1>
            <p class="page-subtitle">{{ data.cmo.nip }} — {{ data.cmo.area }} | Total: {{ data.total_customers }} customer</p>
          </div>
          <a routerLink="/bm" class="btn btn--secondary btn--sm">Kembali</a>
        </div>

        <div class="card animate-fade-in-up">
          <div class="card__body" style="padding:0; overflow-x:auto;">
            @if (data.customers.length === 0) {
              <div class="empty-state"><h3 class="empty-state__title">Tidak ada customer</h3></div>
            } @else {
              <table class="data-table">
                <thead><tr><th>No Kontrak</th><th>Nama</th><th>Status</th><th>Score</th><th>Risk</th><th>Rekomendasi</th><th>Aksi</th></tr></thead>
                <tbody>
                  @for (c of data.customers; track c.customer_id) {
                    <tr>
                      <td><code>{{ c.no_contract }}</code></td>
                      <td><strong>{{ c.customer_name }}</strong></td>
                      <td>
                        @switch (c.fraud_status) {
                          @case ('FLAGGED') { <span class="badge badge--danger">Flagged</span> }
                          @case ('CONFIRMED_FRAUD') { <span class="badge badge--danger">Fraud</span> }
                          @case ('CLEAN') { <span class="badge badge--success">Clean</span> }
                          @default { <span class="badge badge--neutral">{{ c.fraud_status }}</span> }
                        }
                      </td>
                      <td><strong>{{ c.score_percentage | number:'1.1-1' }}%</strong></td>
                      <td><span class="badge" [class.badge--danger]="c.risk_level.includes('CRITICAL') || c.risk_level.includes('HIGH')" [class.badge--warning]="c.risk_level.includes('MEDIUM')" [class.badge--success]="c.risk_level.includes('LOW')">{{ c.risk_level }}</span></td>
                      <td>{{ c.decision }}</td>
                      <td><a [routerLink]="['/bm/fraud-result', c.customer_id]" class="btn btn--primary btn--sm">Detail</a></td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; h1 { font-size: 1.25rem; font-weight: 700; } }
    .page-subtitle { font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 2px; }
    code { font-family: var(--font-mono); font-size: 0.8rem; }
  `],
})
export class BmCmoCustomersPage implements OnInit {
  readonly facade = inject(BmFacade);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const cmoId = +this.route.snapshot.params['cmoId'];
    if (cmoId) this.facade.loadCmoCustomersData(cmoId);
  }
}
