import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of notify.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" (click)="notify.dismiss(toast.id)">
          <div class="toast__content">
            <strong class="toast__title">{{ toast.title }}</strong>
            <p class="toast__message">{{ toast.message }}</p>
          </div>
          <button class="toast__close" (click)="notify.dismiss(toast.id)">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 380px;
      width: 100%;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
      animation: slideInRight 0.2s ease-out;
      cursor: pointer;

      &--success { border-left: 3px solid var(--color-success); }
      &--error { border-left: 3px solid var(--color-danger); }
      &--warning { border-left: 3px solid var(--color-warning); }
      &--info { border-left: 3px solid var(--color-info); }
    }

    .toast__content { flex: 1; min-width: 0; }
    .toast__title { display: block; font-size: 0.82rem; color: var(--color-text); }
    .toast__message { font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px; line-height: 1.4; }
    .toast__close {
      background: none;
      border: none;
      font-size: 1.1rem;
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
