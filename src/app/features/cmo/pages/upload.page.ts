import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CmoFacade } from '../../../core/facades/cmo.facade';

@Component({
  selector: 'app-cmo-upload',
  standalone: true,
  imports: [FormsModule, DecimalPipe, KeyValuePipe],
  templateUrl: './upload.page.html',
  styleUrl: './upload.page.scss',
})
export class CmoUploadPage implements OnInit {
  readonly facade = inject(CmoFacade);
  private readonly route = inject(ActivatedRoute);

  readonly uploadMode = signal<'all' | 'bulk'>('all');
  readonly selectedCustomerId = signal<number | null>(null);
  readonly selectedCustomerName = signal<string>('');
  readonly showCustomerSelect = signal(false);

  // Upload-All files
  readonly allFiles = signal<Record<string, File | null>>({
    KTP: null, NPWP: null, PBB: null, SLIPGAJI: null,
    MUTASI: null, LISTRIK: null, TEMPAT_TINGGAL: null, USAHA: null,
  });

  // Bulk files
  readonly bulkFiles = signal<File[]>([]);
  readonly isDragOver = signal(false);

  readonly docTypes = [
    { key: 'KTP', label: 'KTP', desc: 'Kartu Tanda Penduduk' },
    { key: 'NPWP', label: 'NPWP', desc: 'Nomor Pokok Wajib Pajak' },
    { key: 'PBB', label: 'PBB', desc: 'Pajak Bumi & Bangunan' },
    { key: 'SLIPGAJI', label: 'Slip Gaji', desc: 'Slip Gaji Karyawan' },
    { key: 'MUTASI', label: 'Mutasi', desc: 'Mutasi Rekening Bank' },
    { key: 'LISTRIK', label: 'Listrik', desc: 'Tagihan Listrik PLN' },
    { key: 'TEMPAT_TINGGAL', label: 'Foto Rumah', desc: 'Bukti Tempat Tinggal' },
    { key: 'USAHA', label: 'Foto Usaha', desc: 'Bukti Tempat Usaha' },
  ];

  ngOnInit(): void {
    this.facade.loadCustomers();
    this.facade.clearResults();
    const qp = this.route.snapshot.queryParams;
    if (qp['customerId']) {
      this.selectedCustomerId.set(+qp['customerId']);
      this.selectedCustomerName.set(qp['customerName'] ?? '');
    }
  }

  selectCustomer(id: number, name: string): void {
    this.selectedCustomerId.set(id);
    this.selectedCustomerName.set(name);
    this.showCustomerSelect.set(false);
  }

  onFileSelected(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.allFiles.update(f => ({ ...f, [key]: input.files![0] }));
    }
  }

  removeFile(key: string): void {
    this.allFiles.update(f => ({ ...f, [key]: null }));
  }

  onBulkFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.bulkFiles.update(f => [...f, ...Array.from(input.files!)]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files) {
      this.bulkFiles.update(f => [...f, ...Array.from(event.dataTransfer!.files)]);
    }
  }

  removeBulkFile(index: number): void {
    this.bulkFiles.update(f => f.filter((_, i) => i !== index));
  }

  get hasAnyFile(): boolean {
    return Object.values(this.allFiles()).some(f => f !== null);
  }

  onUploadAll(): void {
    const cid = this.selectedCustomerId();
    if (cid) this.facade.uploadAll(cid, this.allFiles());
  }

  onUploadBulk(): void {
    const cid = this.selectedCustomerId();
    if (cid) this.facade.uploadBulk(cid, this.bulkFiles());
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
