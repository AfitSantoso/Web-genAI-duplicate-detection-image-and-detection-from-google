import { Injectable, inject, signal } from '@angular/core';
import { AuditApiService } from '../services/audit-api.service';
import { NotificationService } from '../services/notification.service';
import {
  AuditDashboard,
  AuditCmoCustomers,
  CmoFraudSummary,
  FridaysScoreData,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class AuditFacade {
  private readonly auditApi = inject(AuditApiService);
  private readonly notify = inject(NotificationService);

  // ─── State ───────────────────────────────────────────
  private readonly _dashboard = signal<AuditDashboard | null>(null);
  private readonly _cmoList = signal<CmoFraudSummary[]>([]);
  private readonly _cmoCustomers = signal<AuditCmoCustomers | null>(null);
  private readonly _fraudResult = signal<FridaysScoreData | null>(null);
  private readonly _isLoading = signal(false);

  // ─── Selectors ───────────────────────────────────────
  readonly dashboard = this._dashboard.asReadonly();
  readonly cmoList = this._cmoList.asReadonly();
  readonly cmoCustomers = this._cmoCustomers.asReadonly();
  readonly fraudResult = this._fraudResult.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // ─── Actions ─────────────────────────────────────────
  loadDashboard(): void {
    this._isLoading.set(true);
    this.auditApi.getDashboard().subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success) this._dashboard.set(res.data);
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal memuat dashboard audit');
      },
    });
  }

  loadCmoList(): void {
    this._isLoading.set(true);
    this.auditApi.getCmoList().subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success) {
          this._cmoList.set(res.data.cmo_list ?? []);
        }
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal memuat daftar CMO');
      },
    });
  }

  loadCmoCustomers(cmoId: number): void {
    this._isLoading.set(true);
    this._cmoCustomers.set(null);
    this.auditApi.getCmoCustomers(cmoId).subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success) this._cmoCustomers.set(res.data);
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal memuat customer CMO');
      },
    });
  }

  loadFraudResult(customerId: number): void {
    this._isLoading.set(true);
    this._fraudResult.set(null);
    this.auditApi.getCustomerFraudResult(customerId).subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success) this._fraudResult.set(res.data);
      },
      error: (err) => {
        this._isLoading.set(false);
        this.notify.error(
          'Error',
          err?.error?.message ?? 'Gagal memuat fraud result'
        );
      },
    });
  }

  exportReport(): void {
    this._isLoading.set(true);
    this.auditApi.exportExcel().subscribe({
      next: (blob) => {
        this._isLoading.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Detail_Fraud_Report_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notify.success('Berhasil', 'Report detail berhasil di-export ke Excel (.xlsx)');
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal mengambil data export');
      }
    });
  }
}
