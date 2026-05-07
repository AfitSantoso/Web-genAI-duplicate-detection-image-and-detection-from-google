import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BmFacade } from '../../../core/facades/bm.facade';

@Component({
  selector: 'app-bm-cmo-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container page-wrapper">
      <h1 class="page-title animate-fade-in-up">👔 Daftar CMO</h1>

      @if (facade.isLoading()) {
        <div class="loading-overlay"><span class="spinner spinner--lg"></span><p>Memuat data CMO...</p></div>
      } @else if (facade.cmoList().length === 0) {
        <div class="card"><div class="empty-state"><div class="empty-state__icon">👔</div><h3 class="empty-state__title">Belum ada data CMO</h3></div></div>
      } @else {
        <div class="card animate-fade-in-up">
          <div class="card__body" style="padding:0; overflow-x:auto;">
            <table class="data-table">
              <thead><tr><th>Nama</th><th>NIP</th><th>Area</th><th>Customer</th><th>Flagged</th><th>Fraud</th><th>Dok. Fraud</th></tr></thead>
              <tbody>
                @for (cmo of facade.cmoList(); track cmo.cmo_id) {
                  <tr>
                    <td><strong>{{ cmo.cmo_name }}</strong></td>
                    <td><code>{{ cmo.nip }}</code></td>
                    <td>{{ cmo.area }}</td>
                    <td>{{ cmo.total_customers }}</td>
                    <td>@if (cmo.flagged_count > 0) { <span class="badge badge--warning">{{ cmo.flagged_count }}</span> } @else { 0 }</td>
                    <td>@if (cmo.confirmed_fraud_count > 0) { <span class="badge badge--danger">{{ cmo.confirmed_fraud_count }}</span> } @else { 0 }</td>
                    <td>{{ cmo.total_fraud_documents }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`.page-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 24px; } code { font-family: var(--font-mono); font-size: 0.8rem; }`],
})
export class BmCmoListPage implements OnInit {
  readonly facade = inject(BmFacade);
  ngOnInit(): void { this.facade.loadCmoList(); }
}
