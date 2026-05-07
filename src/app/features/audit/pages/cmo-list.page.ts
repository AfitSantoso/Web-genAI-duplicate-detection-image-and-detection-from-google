import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuditFacade } from '../../../core/facades/audit.facade';

@Component({
  selector: 'app-audit-cmo-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container page-wrapper">
      <h1 class="page-title animate-fade-in-up">👔 Audit CMO List</h1>
      @if (facade.isLoading()) {
        <div class="loading-overlay"><span class="spinner spinner--lg"></span></div>
      } @else {
        <div class="card animate-fade-in-up">
          <div class="card__body" style="padding:0; overflow-x:auto;">
            @if (facade.cmoList().length === 0) {
              <div class="empty-state"><div class="empty-state__icon">👔</div><h3 class="empty-state__title">Tidak ada data CMO</h3></div>
            } @else {
              <table class="data-table">
                <thead><tr><th>Nama</th><th>NIP</th><th>Area</th><th>Customer</th><th>Flagged</th><th>Fraud</th><th>Aksi</th></tr></thead>
                <tbody>
                  @for (cmo of facade.cmoList(); track cmo.cmo_id) {
                    <tr>
                      <td><strong>{{ cmo.cmo_name }}</strong></td>
                      <td><code>{{ cmo.nip }}</code></td>
                      <td>{{ cmo.area }}</td>
                      <td>{{ cmo.total_customers }}</td>
                      <td>@if (cmo.flagged_count > 0) { <span class="badge badge--warning">{{ cmo.flagged_count }}</span> } @else { 0 }</td>
                      <td>@if (cmo.confirmed_fraud_count > 0) { <span class="badge badge--danger">{{ cmo.confirmed_fraud_count }}</span> } @else { 0 }</td>
                      <td><a [routerLink]="['/audit/cmo', cmo.cmo_id]" class="btn btn--primary btn--sm">🔍 Customers</a></td>
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
  styles: [`.page-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 24px; } code { font-family: var(--font-mono); font-size: 0.8rem; }`],
})
export class AuditCmoListPage implements OnInit {
  readonly facade = inject(AuditFacade);
  ngOnInit(): void { this.facade.loadCmoList(); }
}
