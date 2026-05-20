import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuditFacade } from '../../../core/facades/audit.facade';

@Component({
  selector: 'app-audit-fraud-result',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './fraud-result.page.html',
  styleUrl: './fraud-result.page.scss',
})
export class AuditFraudResultPage implements OnInit {
  readonly facade = inject(AuditFacade);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = +this.route.snapshot.params['customerId'];
    if (id) this.facade.loadFraudResult(id);
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

  getRiskColor(level: string): string {
    if (level?.includes('CRITICAL') || level?.includes('HIGH')) return 'var(--color-danger)';
    if (level?.includes('MEDIUM')) return 'var(--color-warning)';
    return 'var(--color-success)';
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

  get documentBreakdown(): any[] {
    const res = this.facade.fraudResult();
    if (!res?.breakdown) return [];
    return res.breakdown.filter((i: any) => !this.PROOF_TYPES.includes(i.component));
  }

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
