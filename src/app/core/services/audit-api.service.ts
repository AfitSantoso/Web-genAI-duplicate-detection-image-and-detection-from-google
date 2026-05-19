import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import {
  ApiResponse,
  AuditDashboard,
  AuditCmoCustomers,
  CmoFraudSummary,
  FridaysScoreData,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);

  getDashboard(): Observable<ApiResponse<AuditDashboard>> {
    return this.http.get<ApiResponse<AuditDashboard>>(
      `${this.env.apiUrl}/audit/dashboard`
    );
  }

  getCmoList(): Observable<ApiResponse<{ total: number; cmo_list: CmoFraudSummary[] }>> {
    return this.http.get<ApiResponse<{ total: number; cmo_list: CmoFraudSummary[] }>>(
      `${this.env.apiUrl}/audit/cmo-list`
    );
  }

  getCmoCustomers(cmoId: number): Observable<ApiResponse<AuditCmoCustomers>> {
    return this.http.get<ApiResponse<AuditCmoCustomers>>(
      `${this.env.apiUrl}/audit/cmo/${cmoId}/customers`
    );
  }

  getCustomerFraudResult(
    customerId: number
  ): Observable<ApiResponse<FridaysScoreData>> {
    return this.http.get<ApiResponse<FridaysScoreData>>(
      `${this.env.apiUrl}/audit/customer/${customerId}/fraud-result`
    );
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.env.apiUrl}/audit/export-excel`, {
      responseType: 'blob'
    });
  }
}
