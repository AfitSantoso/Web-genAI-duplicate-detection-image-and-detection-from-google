import { Injectable, signal, computed } from '@angular/core';
import { LoginData, UserRole } from '../models/api.model';

const STORAGE_KEY = 'fridays_auth';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  // ─── State (Signals) ─────────────────────────────────
  private readonly _user = signal<LoginData | null>(this.loadFromStorage());
  private readonly _isLoading = signal(false);

  // ─── Selectors (Computed) ────────────────────────────
  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly userName = computed(() => this._user()?.name ?? '');
  readonly userRole = computed(() => this._user()?.role ?? null);
  readonly userId = computed(() => this._user()?.user_id ?? null);
  readonly userNip = computed(() => this._user()?.nip ?? '');

  // ─── Actions ─────────────────────────────────────────
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setUser(user: LoginData): void {
    this._user.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  isRole(role: UserRole): boolean {
    return this._user()?.role === role;
  }

  // ─── Private ─────────────────────────────────────────
  private loadFromStorage(): LoginData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LoginData) : null;
    } catch {
      return null;
    }
  }
}
