import { Injectable, inject, signal, computed } from '@angular/core';
import { BmApiService } from '../services/bm-api.service';
import { NotificationService } from '../services/notification.service';
import {
  BmDashboard,
  CmoFraudSummary,
  FlaggedCustomer,
  FridaysScoreData,
  ReviewRequest,
  ReviewHistory,
  Customer,
  AuditCmoCustomers,
  AuditCmoCustomer,
} from '../models/api.model';

/**
 * BmFacade — Mediator between UI components and BmApiService.
 *
 * Responsibilities:
 * - Manage state (signals) for all BM-related data
 * - Unwrap backend responses (which use nested `data.xxx` wrappers)
 * - Handle loading/error states
 * - Delegate HTTP calls to BmApiService (SRP)
 */
@Injectable({ providedIn: 'root' })
export class BmFacade {
  private readonly bmApi = inject(BmApiService);
  private readonly notify = inject(NotificationService);

  // ─── State ───────────────────────────────────────────
  private readonly _dashboard = signal<BmDashboard | null>(null);
  private readonly _cmoList = signal<CmoFraudSummary[]>([]);
  private readonly _cmoCustomers = signal<Customer[]>([]);
  private readonly _cmoCustomersData = signal<AuditCmoCustomers | null>(null);
  private readonly _flaggedCustomers = signal<FlaggedCustomer[]>([]);
  private readonly _googleFlagged = signal<FlaggedCustomer[]>([]);
  private readonly _fraudResult = signal<FridaysScoreData | null>(null);
  private readonly _reviewHistory = signal<ReviewHistory[]>([]);
  private readonly _isLoading = signal(false);

  // ─── Selectors (read-only projections) ──────────────
  readonly dashboard = this._dashboard.asReadonly();
  readonly cmoList = this._cmoList.asReadonly();
  readonly cmoCustomers = this._cmoCustomers.asReadonly();
  readonly cmoCustomersData = this._cmoCustomersData.asReadonly();
  readonly flaggedCustomers = this._flaggedCustomers.asReadonly();
  readonly googleFlagged = this._googleFlagged.asReadonly();
  readonly fraudResult = this._fraudResult.asReadonly();
  readonly reviewHistory = this._reviewHistory.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // ─── Actions ─────────────────────────────────────────

  /**
   * Backend: GET /bm/dashboard
   * Response.data = { bm, statistics, cmo_fraud_summary, customers }
   *
   * We map `statistics` → `overview` to match the BmDashboard interface.
   */
  loadDashboard(): void {
    this._isLoading.set(true);
    this.bmApi.getDashboard().subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success && res.data) {
          const raw = res.data;
          const stats = (raw['statistics'] ?? {}) as Record<string, number>;
          const dashboard: BmDashboard = {
            overview: {
              total_cmo: stats['total_cmo'] ?? 0,
              total_customers: stats['total_customers'] ?? 0,
              flagged_customers: stats['flagged_customers'] ?? 0,
              confirmed_fraud: stats['confirmed_fraud'] ?? 0,
              total_fraud_documents: stats['total_fraud_documents'] ?? 0,
            },
            cmo_fraud_summary: (raw['cmo_fraud_summary'] as CmoFraudSummary[]) ?? [],
          };
          this._dashboard.set(dashboard);
        }
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal memuat dashboard BM');
      },
    });
  }

  /**
   * Backend: GET /bm/cmo-list
   * Response.data = { total, cmo_list: CmoFraudSummary[] }
   */
  loadCmoList(): void {
    this._isLoading.set(true);
    this.bmApi.getCmoList().subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success && res.data) {
          this._cmoList.set(res.data.cmo_list ?? []);
        }
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal memuat daftar CMO');
      },
    });
  }

  /**
   * Backend: GET /bm/cmo/{cmoId}/customers
   * Response.data = { cmo, total, customers: [...] }
   */
  loadCmoCustomers(cmoId: number): void {
    this._isLoading.set(true);
    this.bmApi.getCmoCustomers(cmoId).subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success && res.data) {
          const customers = (res.data.customers ?? []) as Customer[];
          this._cmoCustomers.set(customers);
        }
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal memuat customer CMO');
      },
    });
  }

  /**
   * Backend: GET /bm/cmo/{cmoId}/customers
   * Maps to AuditCmoCustomers shape for consistent UI display.
   */
  loadCmoCustomersData(cmoId: number): void {
    this._isLoading.set(true);
    this._cmoCustomersData.set(null);
    this.bmApi.getCmoCustomers(cmoId).subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success && res.data) {
          const raw = res.data;
          const cmoInfo = (raw.cmo ?? {}) as Record<string, unknown>;
          const mapped: AuditCmoCustomers = {
            cmo: {
              id: (cmoInfo['id'] as number) ?? cmoId,
              name: (cmoInfo['name'] as string) ?? '',
              nip: (cmoInfo['nip'] as string) ?? '',
              area: (cmoInfo['area'] as string) ?? '',
            },
            total_customers: (raw as Record<string, unknown>)['total_customers'] as number ?? raw.total ?? 0,
            customers: ((raw.customers ?? []) as Record<string, unknown>[]).map((c) => ({
              customer_id: (c['id'] as number) ?? (c['customer_id'] as number) ?? 0,
              no_contract: (c['no_contract'] as string) ?? '',
              customer_name: (c['name'] as string) ?? (c['customer_name'] as string) ?? '',
              fraud_status: (c['fraud_status'] as string) ?? 'PENDING',
              score_percentage: (c['score_percentage'] as number) ?? 0,
              decision: (c['decision'] as string) ?? '-',
              risk_level: (c['risk_level'] as string) ?? 'LOW',
              total_flagged: (c['total_flagged'] as number) ?? 0,
              any_fraud_detected: (c['any_fraud_detected'] as boolean) ?? false,
              fridays_calculated_at: (c['fridays_calculated_at'] as string) ?? '',
            })),
          };
          this._cmoCustomersData.set(mapped);
        }
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal memuat customer CMO');
      },
    });
  }

  /**
   * Backend: GET /bm/flagged-customers
   * Response.data = { total_flagged, flagged_customers: [...], duplicate_detections: [...] }
   */
  loadFlaggedCustomers(): void {
    this._isLoading.set(true);
    this.bmApi.getFlaggedCustomers().subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success && res.data) {
          this._flaggedCustomers.set(res.data.flagged_customers ?? []);
        }
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal memuat flagged customers');
      },
    });
  }

  /**
   * Backend: GET /bm/google-flagged
   * Response.data = { total, google_flagged: [...] }
   */
  loadGoogleFlagged(): void {
    this.bmApi.getGoogleFlagged().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this._googleFlagged.set(res.data.google_flagged ?? []);
        }
      },
    });
  }

  /** GET /bm/customer/{customerId}/fraud-result */
  loadFraudResult(customerId: number): void {
    this._isLoading.set(true);
    this._fraudResult.set(null);
    this.bmApi.getFraudResult(customerId).subscribe({
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

  /** POST /bm/review/{customerId} */
  submitReview(customerId: number, review: ReviewRequest): void {
    this._isLoading.set(true);
    this.bmApi.submitReview(customerId, review).subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success) {
          this.notify.success('Review Berhasil', res.message);
          this.loadFraudResult(customerId);
          this.loadReviews(customerId);
        } else {
          this.notify.error('Review Gagal', res.message);
        }
      },
      error: (err) => {
        this._isLoading.set(false);
        this.notify.error(
          'Error',
          err?.error?.message ?? 'Gagal mengirim review'
        );
      },
    });
  }

  /**
   * Backend: GET /bm/customer/{customerId}/reviews
   * Response.data = { customer, total_reviews, reviews: [...] }
   */
  loadReviews(customerId: number): void {
    this.bmApi.getReviews(customerId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this._reviewHistory.set(res.data.reviews ?? []);
        }
      },
    });
  }
}
