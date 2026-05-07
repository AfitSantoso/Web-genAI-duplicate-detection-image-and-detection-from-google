import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of notify.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" (click)="notify.dismiss(toast.id)">
          <span class="toast__icon">
            @switch (toast.type) {
              @case ('success') { ✅ }
              @case ('error') { ❌ }
              @case ('warning') { ⚠️ }
              @case ('info') { ℹ️ }
            }
          </span>
          <div class="toast__content">
            <strong class="toast__title">{{ toast.title }}</strong>
            <p class="toast__message">{{ toast.message }}</p>
          </div>
          <button class="toast__close" (click)="notify.dismiss(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 420px;
      width: 100%;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-xl);
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        transform: translateX(-4px);
      }

      &--success { border-left: 4px solid var(--color-success); }
      &--error { border-left: 4px solid var(--color-danger); }
      &--warning { border-left: 4px solid var(--color-warning); }
      &--info { border-left: 4px solid var(--color-info); }
    }

    .toast__icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }
    .toast__content { flex: 1; min-width: 0; }
    .toast__title { display: block; font-size: 0.85rem; color: var(--color-text); }
    .toast__message { font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px; line-height: 1.4; }
    .toast__close {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      flex-shrink: 0;

      &:hover { color: var(--color-text); }
    }
  `],
})
export class ToastComponent {
  readonly notify = inject(NotificationService);
}
