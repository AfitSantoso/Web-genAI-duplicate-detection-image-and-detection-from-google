import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { BmFacade } from '../../../core/facades/bm.facade';
import { ReviewRequest } from '../../../core/models/api.model';
import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-fraud-result',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
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
}
