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
          <h1 class="login-header__title">FRIDAYS</h1>
          <p class="login-header__subtitle">Fraud Detection & Document Intelligence System</p>
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
              {{ showPassword() ? 'Hide' : 'Show' }}
            </button>
          </div>

          @if (auth.loginError()) {
            <div class="login-error animate-fade-in">
              {{ auth.loginError() }}
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


      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F3F4F6;
      padding: 20px;
    }

    .login-container {
      width: 100%;
      max-width: 400px;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      overflow: hidden;
    }

    .login-header {
      text-align: center;
      padding: 32px 28px 20px;

      &__title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 4px;
      }

      &__subtitle {
        font-size: 0.82rem;
        color: var(--color-text-muted);
        margin-bottom: 10px;
      }

      &__badge {
        display: inline-block;
        font-size: 0.7rem;
        font-weight: 500;
        color: var(--color-primary);
        background: var(--color-primary-50);
        padding: 2px 10px;
        border-radius: var(--radius-full);
      }
    }

    .login-form {
      padding: 24px 28px;
    }

    .role-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }

    .role-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 8px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: var(--font-family);

      &:hover {
        border-color: var(--color-primary-light);
        background: var(--color-primary-50);
      }

      &.active {
        border-color: var(--color-primary);
        background: var(--color-primary-50);
        color: var(--color-primary);
      }

      &__label {
        font-size: 0.8rem;
        font-weight: 600;
      }
    }

    .form-group {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 10px;
      bottom: 8px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.78rem;
      color: var(--color-text-muted);
      font-family: var(--font-family);

      &:hover {
        color: var(--color-text);
      }
    }

    .login-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--color-danger-light);
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      color: #991b1b;
      margin-bottom: 16px;
    }

    .login-footer {
      padding: 16px 28px;
      background: var(--color-bg);
      border-top: 1px solid var(--color-border-light);
      text-align: center;

      &__text {
        font-size: 0.72rem;
        color: var(--color-text-muted);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 6px;
      }

      &__creds {
        display: flex;
        flex-direction: column;
        gap: 4px;

        code {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--color-text-secondary);
          background: var(--color-surface);
          padding: 3px 8px;
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
