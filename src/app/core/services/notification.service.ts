import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _counter = 0;
  private readonly _toasts = signal<ToastMessage[]>([]);

  readonly toasts = this._toasts.asReadonly();

  success(title: string, message: string): void {
    this.add('success', title, message);
  }

  error(title: string, message: string): void {
    this.add('error', title, message);
  }

  info(title: string, message: string): void {
    this.add('info', title, message);
  }

  warning(title: string, message: string): void {
    this.add('warning', title, message);
  }

  dismiss(id: number): void {
    this._toasts.update((t) => t.filter((toast) => toast.id !== id));
  }

  private add(
    type: ToastMessage['type'],
    title: string,
    message: string
  ): void {
    const id = ++this._counter;
    const toast: ToastMessage = { id, type, title, message };
    this._toasts.update((t) => [...t, toast]);

    setTimeout(() => this.dismiss(id), 5000);
  }
}
