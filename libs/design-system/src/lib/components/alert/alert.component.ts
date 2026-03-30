import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  variant = input<'info' | 'success' | 'warning' | 'error'>('info');
  dismissible = input(false);

  dismissed = output<void>();
}
