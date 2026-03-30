import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  variant = input<'default' | 'primary' | 'success' | 'warning' | 'error'>('default');
  size = input<'sm' | 'md' | 'lg'>('md');
}
