import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import {
  ApiResponse,
  LoginData,
  LoginRequest,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);

  login(request: LoginRequest): Observable<ApiResponse<LoginData>> {
    const formData = new FormData();
    formData.append('nip', request.nip);
    formData.append('password', request.password);
    formData.append('role', request.role);

    return this.http.post<ApiResponse<LoginData>>(
      `${this.env.apiUrl}/auth/login`,
      formData
    );
  }
}
