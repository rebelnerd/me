import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  src = input<string>('');
  alt = input<string>('');
  name = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  initials = computed(() => {
    const n = this.name();
    if (!n) return '?';
    return n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  });
}
