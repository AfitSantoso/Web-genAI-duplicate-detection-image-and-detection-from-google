import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthFacade } from '../../core/facades/auth.facade';
import { UserRole } from '../../core/models/api.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-container animate-fade-in-up">
        <div class="login-header">
          <div class="login-header__logo">🛡️</div>
          <h1 class="login-header__title">FRIDAYS</h1>
          <p class="login-header__subtitle">Fraud Detection & Document Intelligence System</p>
          <span class="login-header__badge">v4.0</span>
        </div>

        <form class="login-form" (ngSubmit)="onLogin()">
          <div class="role-selector">
            @for (r of roles; track r.value) {
              <button
                type="button"
                class="role-btn"
                [class.active]="selectedRole() === r.value"
                (click)="selectedRole.set(r.value)">
                <span class="role-btn__label">{{ r.label }}</span>
              </button>
            }
          </div>

          <div class="form-group">
            <label for="nip">NIP (Nomor Pegawai)</label>
            <input
              id="nip"
              class="form-control"
              type="text"
              [(ngModel)]="nip"
              name="nip"
              placeholder="Contoh: CMO001"
              required
              autocomplete="username" />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              class="form-control"
              [type]="showPassword() ? 'text' : 'password'"
              [(ngModel)]="password"
              name="password"
              placeholder="Masukkan password"
              required
              autocomplete="current-password" />
            <button
              type="button"
              class="password-toggle"
              (click)="showPassword.set(!showPassword())">
              {{ showPassword() ? '🙈' : '👁️' }}
            </button>
          </div>

          @if (auth.loginError()) {
            <div class="login-error animate-fade-in">
              <span>⚠️</span> {{ auth.loginError() }}
            </div>
          }

          <button
            type="submit"
            class="btn btn--primary btn--lg btn--full"
            [disabled]="auth.isLoading() || !nip || !password">
            @if (auth.isLoading()) {
              <span class="spinner spinner--sm"></span>
              Memproses...
            } @else {
              Masuk sebagai {{ selectedRole() }}
            }
          </button>
        </form>

        <div class="login-footer">
          <p class="login-footer__text">Demo Credentials</p>
          <div class="login-footer__creds">
            <code>CMO001 / Cmo&#64;12345</code>
            <code>BM001 / Bm&#64;12345</code>
            <code>AUD001 / Audit&#64;12345</code>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-primary-dark);
      position: relative;
      overflow: hidden;
      padding: 20px;
    }

    .login-page::before {
      content: '';
      position: absolute;
      top: -40%;
      right: -20%;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(212, 168, 67, 0.08) 0%, transparent 70%);
      border-radius: 50%;
    }

    .login-page::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(30, 41, 59, 0.6) 0%, transparent 70%);
      border-radius: 50%;
    }

    .login-container {
      width: 100%;
      max-width: 440px;
      background: rgba(255, 255, 255, 0.98);
      border-radius: var(--radius-xl);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    .login-header {
      text-align: center;
      padding: 40px 32px 24px;
      background: var(--color-primary-dark);
      color: white;

      &__logo {
        font-size: 2.8rem;
        margin-bottom: 12px;
      }

      &__title {
        font-size: 2rem;
        font-weight: 900;
        letter-spacing: -0.04em;
        margin-bottom: 6px;
        color: var(--color-accent);
      }

      &__subtitle {
        font-size: 0.85rem;
        opacity: 0.6;
        margin-bottom: 12px;
      }

      &__badge {
        display: inline-block;
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--color-accent);
        background: rgba(212, 168, 67, 0.15);
        padding: 3px 12px;
        border-radius: var(--radius-full);
        letter-spacing: 0.06em;
      }
    }

    .login-form {
      padding: 32px;
    }

    .role-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 24px;
    }

    .role-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 8px;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: var(--font-family);

      &:hover {
        border-color: var(--color-primary-light);
        background: var(--color-primary-50);
      }

      &.active {
        border-color: var(--color-primary-dark);
        background: var(--color-primary-50);
        box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
      }

      &__label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-text);
      }
    }

    .form-group {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      bottom: 10px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 2px 4px;
    }

    .login-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      background: var(--color-danger-light);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      color: #991b1b;
      margin-bottom: 20px;
    }

    .login-footer {
      padding: 20px 32px;
      background: var(--color-bg);
      border-top: 1px solid var(--color-border-light);
      text-align: center;

      &__text {
        font-size: 0.75rem;
        color: var(--color-text-muted);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }

      &__creds {
        display: flex;
        flex-direction: column;
        gap: 4px;

        code {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          background: var(--color-surface);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
        }
      }
    }
  `],
})
export class LoginPage {
  readonly auth = inject(AuthFacade);

  nip = '';
  password = '';
  readonly selectedRole = signal<UserRole>('CMO');
  readonly showPassword = signal(false);

  readonly roles = [
    { value: 'CMO' as UserRole, label: 'CMO' },
    { value: 'BM' as UserRole, label: 'Branch Manager' },
    { value: 'AUDIT' as UserRole, label: 'Auditor' },
  ];

  onLogin(): void {
    if (this.nip && this.password) {
      this.auth.login(this.nip, this.password, this.selectedRole());
    }
  }
}
