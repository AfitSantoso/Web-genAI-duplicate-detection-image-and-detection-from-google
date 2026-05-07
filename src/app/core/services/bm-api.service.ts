import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import {
  ApiResponse,
  CmoFraudSummary,
  FlaggedCustomer,
  FridaysScoreData,
  ReviewHistory,
  ReviewRequest,
} from '../models/api.model';

/**
 * BM API Service — Single Responsibility: HTTP calls only.
 *
 * Response types mirror the **actual** backend JSON shape (wrapped objects),
 * so facades can safely unwrap them without casting errors.
 */
@Injectable({ providedIn: 'root' })
export class BmApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);

  /** GET /bm/dashboard → { bm, statistics, cmo_fraud_summary, customers } */
  getDashboard(): Observable<ApiResponse<Record<string, unknown>>> {
    return this.http.get<ApiResponse<Record<string, unknown>>>(
      `${this.env.apiUrl}/bm/dashboard`
    );
  }

  /** GET /bm/cmo-list → { total, cmo_list: CmoFraudSummary[] } */
  getCmoList(): Observable<ApiResponse<{ total: number; cmo_list: CmoFraudSummary[] }>> {
    return this.http.get<ApiResponse<{ total: number; cmo_list: CmoFraudSummary[] }>>(
      `${this.env.apiUrl}/bm/cmo-list`
    );
  }

  /** GET /bm/cmo/{cmoId}/customers → { cmo, total, customers: [...] } */
  getCmoCustomers(cmoId: number): Observable<ApiResponse<{ cmo: Record<string, unknown>; total: number; customers: unknown[] }>> {
    return this.http.get<ApiResponse<{ cmo: Record<string, unknown>; total: number; customers: unknown[] }>>(
      `${this.env.apiUrl}/bm/cmo/${cmoId}/customers`
    );
  }

  /** GET /bm/flagged-customers → { total_flagged, flagged_customers, duplicate_detections } */
  getFlaggedCustomers(): Observable<ApiResponse<{ total_flagged: number; flagged_customers: FlaggedCustomer[]; duplicate_detections: unknown[] }>> {
    return this.http.get<ApiResponse<{ total_flagged: number; flagged_customers: FlaggedCustomer[]; duplicate_detections: unknown[] }>>(
      `${this.env.apiUrl}/bm/flagged-customers`
    );
  }

  /** GET /bm/google-flagged → { total, google_flagged: [...] } */
  getGoogleFlagged(): Observable<ApiResponse<{ total: number; google_flagged: FlaggedCustomer[] }>> {
    return this.http.get<ApiResponse<{ total: number; google_flagged: FlaggedCustomer[] }>>(
      `${this.env.apiUrl}/bm/google-flagged`
    );
  }

  /** GET /bm/customer/{customerId}/fraud-result → FridaysScoreData */
  getFraudResult(
    customerId: number
  ): Observable<ApiResponse<FridaysScoreData>> {
    return this.http.get<ApiResponse<FridaysScoreData>>(
      `${this.env.apiUrl}/bm/customer/${customerId}/fraud-result`
    );
  }

  /** POST /bm/review/{customerId} */
  submitReview(
    customerId: number,
    review: ReviewRequest
  ): Observable<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('review_status', review.review_status);
    if (review.review_notes) {
      formData.append('review_notes', review.review_notes);
    }

    return this.http.post<ApiResponse<unknown>>(
      `${this.env.apiUrl}/bm/review/${customerId}`,
      formData
    );
  }

  /** GET /bm/customer/{customerId}/reviews → { customer, total_reviews, reviews } */
  getReviews(customerId: number): Observable<ApiResponse<{ customer: unknown; total_reviews: number; reviews: ReviewHistory[] }>> {
    return this.http.get<ApiResponse<{ customer: unknown; total_reviews: number; reviews: ReviewHistory[] }>>(
      `${this.env.apiUrl}/bm/customer/${customerId}/reviews`
    );
  }
}
