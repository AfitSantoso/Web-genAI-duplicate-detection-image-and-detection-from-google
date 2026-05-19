import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuditFacade } from '../../../core/facades/audit.facade';

@Component({
  selector: 'app-audit-fraud-result',
  standalone: true,
  imports: [DecimalPipe],
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
}
