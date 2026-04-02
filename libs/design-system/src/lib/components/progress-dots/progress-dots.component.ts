import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-progress-dots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-dots.component.html',
  styleUrl: './progress-dots.component.scss',
})
export class ProgressDotsComponent {
  total = input(0);
  current = input(0);
  completed = input(0);

  dots = computed(() => {
    return Array.from({ length: this.total() }, (_, i) => ({
      index: i,
      state: i < this.completed()
        ? 'completed'
        : i === this.current()
          ? 'active'
          : 'inactive' as 'completed' | 'active' | 'inactive',
    }));
  });
}
