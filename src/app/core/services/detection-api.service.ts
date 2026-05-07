import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { ApiResponse, DetectDuplicateResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class DetectionApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);

  detectDuplicate(file: File): Observable<ApiResponse<DetectDuplicateResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<ApiResponse<DetectDuplicateResponse>>(
      `${this.env.apiUrl}/detect-duplicate`,
      formData
    );
  }
}
