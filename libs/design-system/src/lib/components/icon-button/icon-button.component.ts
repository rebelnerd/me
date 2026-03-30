import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ds-icon-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
})
export class IconButtonComponent {
  variant = input<'primary' | 'outline' | 'ghost' | 'error'>('ghost');
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  shape = input<'circle' | 'square'>('circle');
  icon = input.required<any>();
  ariaLabel = input<string>('');
  disabled = input(false);

  clicked = output<void>();

  iconSize = () => {
    const sizes = { xs: 14, sm: 16, md: 20, lg: 24 };
    return sizes[this.size()];
  };
}
