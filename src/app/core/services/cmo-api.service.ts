import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import {
  ApiResponse,
  CmoProfile,
  Customer,
  UploadAllResponse,
  UploadBulkResponse,
  UploadDocumentResponse,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class CmoApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);

  getProfile(): Observable<ApiResponse<CmoProfile>> {
    return this.http.get<ApiResponse<CmoProfile>>(
      `${this.env.apiUrl}/cmo/profile`
    );
  }

  getCustomers(): Observable<ApiResponse<{ total: number; cmo: Record<string, unknown>; customers: Customer[] }>> {
    return this.http.get<ApiResponse<{ total: number; cmo: Record<string, unknown>; customers: Customer[] }>>(
      `${this.env.apiUrl}/cmo/customers`
    );
  }

  createCustomer(name: string): Observable<ApiResponse<Customer>> {
    const formData = new FormData();
    formData.append('name', name);

    return this.http.post<ApiResponse<Customer>>(
      `${this.env.apiUrl}/cmo/customer`,
      formData
    );
  }

  uploadDocument(
    customerId: number,
    documentType: string,
    file: File
  ): Observable<ApiResponse<UploadDocumentResponse>> {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file, file.name);

    return this.http.post<ApiResponse<UploadDocumentResponse>>(
      `${this.env.apiUrl}/cmo/customer/${customerId}/upload-document`,
      formData
    );
  }

  uploadAll(
    customerId: number,
    files: Record<string, File | null>
  ): Observable<ApiResponse<UploadAllResponse>> {
    const formData = new FormData();

    const fieldMap: Record<string, string> = {
      KTP: 'file_ktp',
      NPWP: 'file_npwp',
      PBB: 'file_pbb',
      SLIPGAJI: 'file_slipgaji',
      MUTASI: 'file_mutasi',
      LISTRIK: 'file_listrik',
      TEMPAT_TINGGAL: 'file_tempat_tinggal',
      USAHA: 'file_usaha',
    };

    for (const [type, file] of Object.entries(files)) {
      if (file && fieldMap[type]) {
        formData.append(fieldMap[type], file, file.name);
      }
    }

    return this.http.post<ApiResponse<UploadAllResponse>>(
      `${this.env.apiUrl}/cmo/customer/${customerId}/upload-all`,
      formData
    );
  }

  uploadBulk(
    customerId: number,
    files: File[]
  ): Observable<ApiResponse<UploadBulkResponse>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file, file.name);
    });

    return this.http.post<ApiResponse<UploadBulkResponse>>(
      `${this.env.apiUrl}/cmo/customer/${customerId}/upload-bulk`,
      formData
    );
  }
}
