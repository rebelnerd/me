import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ds-focus-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './focus-card.component.html',
  styleUrl: './focus-card.component.scss',
})
export class FocusCardComponent {
  title = input<string>('');
  subtitle = input<string>('');
  variant = input<'default' | 'complete' | 'empty'>('default');
  emptyIcon = input<any>(null);
}
