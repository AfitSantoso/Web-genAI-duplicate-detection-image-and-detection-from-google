import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BmFacade } from '../../../core/facades/bm.facade';

@Component({
  selector: 'app-bm-flagged',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container page-wrapper">
      <h1 class="page-title animate-fade-in-up">Customer Flagged & Google Flagged</h1>

      @if (facade.isLoading()) {
        <div class="loading-overlay"><span class="spinner spinner--lg"></span><p>Memuat data...</p></div>
      } @else {
        <div class="card animate-fade-in-up">
          <div class="card__header"><h2 class="card__title">Flagged Customers</h2></div>
          <div class="card__body" style="padding:0; overflow-x:auto;">
            @if (facade.flaggedCustomers().length === 0) {
              <div class="empty-state"><h3 class="empty-state__title">Tidak ada customer flagged</h3></div>
            } @else {
              <table class="data-table">
                <thead><tr><th>No Kontrak</th><th>Nama</th><th>CMO</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>
                  @for (c of facade.flaggedCustomers(); track c.id) {
                    <tr>
                      <td><code>{{ c.no_contract }}</code></td>
                      <td><strong>{{ c.name }}</strong></td>
                      <td>{{ c.cmo_name }} ({{ c.cmo_nip }})</td>
                      <td><span class="badge badge--danger">{{ c.fraud_status }}</span></td>
                      <td><a [routerLink]="['/bm/fraud-result', c.id]" class="btn btn--primary btn--sm">Detail</a></td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>

        <div class="card animate-fade-in-up" style="margin-top: 20px;">
          <div class="card__header"><h2 class="card__title">Google Lens Flagged</h2></div>
          <div class="card__body" style="padding:0; overflow-x:auto;">
            @if (facade.googleFlagged().length === 0) {
              <div class="empty-state"><h3 class="empty-state__title">Tidak ada customer dengan bukti dari internet</h3></div>
            } @else {
              <table class="data-table">
                <thead><tr><th>No Kontrak</th><th>Nama</th><th>CMO</th><th>Aksi</th></tr></thead>
                <tbody>
                  @for (c of facade.googleFlagged(); track c.id) {
                    <tr>
                      <td><code>{{ c.no_contract }}</code></td>
                      <td><strong>{{ c.name }}</strong></td>
                      <td>{{ c.cmo_name }}</td>
                      <td><a [routerLink]="['/bm/fraud-result', c.id]" class="btn btn--primary btn--sm">Detail</a></td>
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
  styles: [`.page-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 20px; } code { font-family: var(--font-mono); font-size: 0.8rem; }`],
})
export class BmFlaggedPage implements OnInit {
  readonly facade = inject(BmFacade);

  ngOnInit(): void {
    this.facade.loadFlaggedCustomers();
    this.facade.loadGoogleFlagged();
  }
}
