import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { BmFacade } from '../../../core/facades/bm.facade';
import { ReviewRequest } from '../../../core/models/api.model';
import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-fraud-result',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink],
  templateUrl: './fraud-result.page.html',
  styleUrl: './fraud-result.page.scss',
})
export class FraudResultPage implements OnInit {
  readonly facade = inject(BmFacade);
  readonly auth = inject(AuthFacade);
  private readonly route = inject(ActivatedRoute);

  readonly showReviewModal = signal(false);
  reviewStatus: 'FLAGGED' | 'CLEAN' | 'CONFIRMED_FRAUD' = 'CLEAN';
  reviewNotes = '';

  private customerId = 0;

  ngOnInit(): void {
    this.customerId = +this.route.snapshot.params['customerId'];
    if (this.customerId) {
      this.facade.loadFraudResult(this.customerId);
      this.facade.loadReviews(this.customerId);
    }
  }

  getRiskColor(level: string): string {
    if (!level) return 'var(--color-text-muted)';
    const l = typeof level === 'string' ? level : '';
    if (l.includes('CRITICAL') || l.includes('HIGH')) return 'var(--color-danger)';
    if (l.includes('MEDIUM')) return 'var(--color-warning)';
    return 'var(--color-success)';
  }

  getRiskLevelString(riskLevel: string | { level?: string }): string {
    if (typeof riskLevel === 'string') return riskLevel;
    return riskLevel?.level ?? 'UNKNOWN';
  }

  getOcrExtractionNote(item: any): string | null {
    // Hanya tampilkan jika dokumen terdeteksi sebagai DUPLIKAT
    if (!item.detection_status?.includes('DUPLICATE')) {
      return null;
    }

    // Jika OCR berhasil (status OK), tidak perlu menampilkan catatan ekstraksi / warning
    if (item.ocr_diagnostics?.status === 'OK') {
      return null;
    }

    // Jika ada catatan ekstraksi dari backend untuk dokumen duplikat
    if (item.ocr_extraction_note) {
      return item.ocr_extraction_note;
    }

    // Jika duplicate tapi previous_customer kosong/null (instant duplicate dengan OCR gagal)
    if (!item.previous_customer) {
      const docLabels: Record<string, string> = {
        'KTP': 'KTP (Kartu Tanda Penduduk)',
        'NPWP': 'NPWP (Nomor Pokok Wajib Pajak)',
        'PBB': 'PBB (Pajak Bumi dan Bangunan)',
        'SLIPGAJI': 'Slip Gaji',
        'MUTASI': 'Mutasi Rekening',
        'LISTRIK': 'Tagihan Listrik PLN'
      };
      const label = docLabels[item.component] || item.component;
      return `Dokumen ${label} terdeteksi sebagai DUPLIKAT PERSIS melalui perbandingan image hash (sidik jari digital gambar), namun sistem OCR tidak berhasil mengekstrak teks dari dokumen ini. Kemungkinan penyebab: kualitas gambar rendah, dokumen blur/buram, foto terlalu gelap/terang, atau format file tidak optimal. Meskipun detail field (seperti NIK, Nama, dll) tidak dapat ditampilkan, gambar dokumen ini 100% identik dengan dokumen yang sudah ada di database.`;
    }
    return null;
  }

  submitReview(): void {
    const review: ReviewRequest = {
      review_status: this.reviewStatus,
      review_notes: this.reviewNotes,
    };
    this.facade.submitReview(this.customerId, review);
    this.showReviewModal.set(false);
    this.reviewNotes = '';
  }

  get isBm(): boolean {
    return this.auth.userRole() === 'BM';
  }

  get flaggedDocuments(): string[] {
    const res = this.facade.fraudResult();
    if (!res?.breakdown) return [];
    return res.breakdown
      .filter(i => i.detection_status?.includes('DUPLICATE') || i.similarity_percentage > 50)
      .map(i => i.component);
  }

  get cleanDocuments(): string[] {
    const res = this.facade.fraudResult();
    if (!res?.breakdown) return [];
    return res.breakdown
      .filter(i => !i.detection_status?.includes('DUPLICATE') && i.similarity_percentage <= 50)
      .map(i => i.component);
  }

  private readonly PROOF_TYPES = ['TEMPAT_TINGGAL', 'USAHA'];

  /** Breakdown items that are documents (KTP, NPWP, PBB, etc.) */
  get documentBreakdown(): any[] {
    const res = this.facade.fraudResult();
    if (!res?.breakdown) return [];
    return res.breakdown.filter((i: any) => !this.PROOF_TYPES.includes(i.component));
  }

  /** Breakdown items that are proofs (TEMPAT_TINGGAL, USAHA) */
  get proofBreakdown(): any[] {
    const res = this.facade.fraudResult();
    if (!res?.breakdown) return [];
    return res.breakdown.filter((i: any) => this.PROOF_TYPES.includes(i.component));
  }

  getProofLabel(component: string): string {
    const labels: Record<string, string> = {
      'TEMPAT_TINGGAL': 'Foto Tempat Tinggal',
      'USAHA': 'Foto Tempat Usaha',
    };
    return labels[component] || component;
  }
}
