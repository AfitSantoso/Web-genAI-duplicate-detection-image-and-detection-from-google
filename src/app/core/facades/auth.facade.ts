import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';
import { AuthStore } from '../state/auth.store';
import { NotificationService } from '../services/notification.service';
import { LoginRequest, UserRole } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  // ─── Exposed State ───────────────────────────────────
  readonly user = this.authStore.user;
  readonly isAuthenticated = this.authStore.isAuthenticated;
  readonly isLoading = this.authStore.isLoading;
  readonly userName = this.authStore.userName;
  readonly userRole = this.authStore.userRole;
  readonly userId = this.authStore.userId;
  readonly userNip = this.authStore.userNip;

  // ─── Error State ─────────────────────────────────────
  private readonly _loginError = signal<string | null>(null);
  readonly loginError = this._loginError.asReadonly();

  // ─── Actions ─────────────────────────────────────────
  login(nip: string, password: string, role: UserRole): void {
    this._loginError.set(null);
    this.authStore.setLoading(true);

    const request: LoginRequest = { nip, password, role };

    this.authApi.login(request).subscribe({
      next: (response) => {
        this.authStore.setLoading(false);
        if (response.success) {
          this.authStore.setUser(response.data);
          this.notify.success('Login Berhasil', response.message);
          this.navigateByRole(response.data.role);
        } else {
          this._loginError.set(response.message);
          this.notify.error('Login Gagal', response.message);
        }
      },
      error: (err) => {
        this.authStore.setLoading(false);
        const msg = err?.error?.message ?? 'Koneksi ke server gagal. Pastikan backend sudah berjalan.';
        this._loginError.set(msg);
        this.notify.error('Login Gagal', msg);
      },
    });
  }

  logout(): void {
    this.authStore.clearUser();
    this.notify.info('Logout', 'Anda telah keluar dari sistem.');
    this.router.navigate(['/login']);
  }

  private navigateByRole(role: UserRole): void {
    switch (role) {
      case 'CMO':
        this.router.navigate(['/cmo']);
        break;
      case 'BM':
        this.router.navigate(['/bm']);
        break;
      case 'AUDIT':
        this.router.navigate(['/audit']);
        break;
    }
  }
}
