import { Injectable, inject, signal, computed } from '@angular/core';
import { CmoApiService } from '../services/cmo-api.service';
import { NotificationService } from '../services/notification.service';
import {
  Customer,
  CmoProfile,
  UploadAllResponse,
  UploadBulkResponse,
} from '../models/api.model';

/**
 * CmoFacade — Mediator between UI components and CmoApiService.
 *
 * Responsibilities:
 * - Manage state (signals) for CMO-related data
 * - Unwrap backend responses (which nest data in wrapper objects)
 * - Handle loading/error states
 * - Delegate HTTP calls to CmoApiService (SRP)
 */
@Injectable({ providedIn: 'root' })
export class CmoFacade {
  private readonly cmoApi = inject(CmoApiService);
  private readonly notify = inject(NotificationService);

  // ─── State ───────────────────────────────────────────
  private readonly _profile = signal<CmoProfile | null>(null);
  private readonly _customers = signal<Customer[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _uploadResult = signal<UploadAllResponse | null>(null);
  private readonly _bulkResult = signal<UploadBulkResponse | null>(null);
  private readonly _uploadProgress = signal(0);

  // ─── Selectors ───────────────────────────────────────
  readonly profile = this._profile.asReadonly();
  readonly customers = this._customers.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly uploadResult = this._uploadResult.asReadonly();
  readonly bulkResult = this._bulkResult.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly customerCount = computed(() => this._customers().length);

  // ─── Actions ─────────────────────────────────────────

  loadProfile(): void {
    this.cmoApi.getProfile().subscribe({
      next: (res) => {
        if (res.success) this._profile.set(res.data);
      },
      error: () => this.notify.error('Error', 'Gagal memuat profil CMO'),
    });
  }

  /**
   * Backend: GET /cmo/customers
   * Response.data = { total, cmo: {...}, customers: Customer[] }
   *
   * The backend wraps the array inside an object — we unwrap `customers`.
   */
  loadCustomers(): void {
    this._isLoading.set(true);
    this.cmoApi.getCustomers().subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success && res.data) {
          // Backend returns { total, cmo, customers: [...] }
          const customers = res.data.customers ?? [];
          this._customers.set(Array.isArray(customers) ? customers : []);
        }
      },
      error: () => {
        this._isLoading.set(false);
        this.notify.error('Error', 'Gagal memuat daftar customer');
      },
    });
  }

  createCustomer(name: string): void {
    this._isLoading.set(true);
    this.cmoApi.createCustomer(name).subscribe({
      next: (res) => {
        this._isLoading.set(false);
        if (res.success) {
          this.notify.success('Berhasil', res.message);
          this.loadCustomers();
        } else {
          this.notify.error('Gagal', res.message);
        }
      },
      error: (err) => {
        this._isLoading.set(false);
        this.notify.error(
          'Error',
          err?.error?.message ?? 'Gagal membuat customer'
        );
      },
    });
  }

  uploadAll(customerId: number, files: Record<string, File | null>): void {
    this._isLoading.set(true);
    this._uploadProgress.set(10);
    this._uploadResult.set(null);

    const progressInterval = setInterval(() => {
      this._uploadProgress.update((p) => Math.min(p + 5, 90));
    }, 1000);

    this.cmoApi.uploadAll(customerId, files).subscribe({
      next: (res) => {
        clearInterval(progressInterval);
        this._uploadProgress.set(100);
        this._isLoading.set(false);
        if (res.success) {
          this._uploadResult.set(res.data);
          this.notify.success('Upload Berhasil', res.message);
        } else {
          this.notify.error('Upload Gagal', res.message);
        }
      },
      error: (err) => {
        clearInterval(progressInterval);
        this._uploadProgress.set(0);
        this._isLoading.set(false);
        this.notify.error(
          'Upload Error',
          err?.error?.message ?? 'Gagal mengupload dokumen'
        );
      },
    });
  }

  uploadBulk(customerId: number, files: File[]): void {
    this._isLoading.set(true);
    this._uploadProgress.set(10);
    this._bulkResult.set(null);

    const progressInterval = setInterval(() => {
      this._uploadProgress.update((p) => Math.min(p + 3, 90));
    }, 1000);

    this.cmoApi.uploadBulk(customerId, files).subscribe({
      next: (res) => {
        clearInterval(progressInterval);
        this._uploadProgress.set(100);
        this._isLoading.set(false);
        if (res.success) {
          this._bulkResult.set(res.data);
          this.notify.success('Bulk Upload Berhasil', res.message);
        } else {
          this.notify.error('Bulk Upload Gagal', res.message);
        }
      },
      error: (err) => {
        clearInterval(progressInterval);
        this._uploadProgress.set(0);
        this._isLoading.set(false);
        this.notify.error(
          'Bulk Upload Error',
          err?.error?.message ?? 'Gagal mengupload dokumen'
        );
      },
    });
  }

  clearResults(): void {
    this._uploadResult.set(null);
    this._bulkResult.set(null);
    this._uploadProgress.set(0);
  }
}
