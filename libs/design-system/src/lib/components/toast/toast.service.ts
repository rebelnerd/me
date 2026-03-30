import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, variant: Toast['variant'] = 'info', duration = 5000) {
    const toast: Toast = { id: this.nextId++, message, variant, duration };
    this.toasts.update((t) => [...t, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string, duration?: number) { this.show(message, 'success', duration); }
  error(message: string, duration?: number) { this.show(message, 'error', duration); }
  warning(message: string, duration?: number) { this.show(message, 'warning', duration); }
  info(message: string, duration?: number) { this.show(message, 'info', duration); }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
