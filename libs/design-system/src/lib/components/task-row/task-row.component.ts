import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, GripVertical, Lock, Repeat } from 'lucide-angular';

@Component({
  selector: 'ds-task-row',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './task-row.component.html',
  styleUrl: './task-row.component.scss',
})
export class TaskRowComponent {
  title = input('');
  done = input(false);
  blocked = input(false);
  draggable = input(true);
  priority = input<'none' | 'low' | 'medium' | 'high'>('none');
  dueDate = input<string | null>(null);
  hasTags = input(false);
  recurring = input(false);

  toggled = output<void>();
  deleted = output<void>();
  tapped = output<void>();

  protected readonly gripIcon = GripVertical;
  protected readonly lockIcon = Lock;
  protected readonly repeatIcon = Repeat;

  get dueDateDisplay(): string {
    const d = this.dueDate();
    if (!d) return '';
    const date = new Date(d + 'T12:00:00');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (d === todayStr) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  get isOverdue(): boolean {
    const d = this.dueDate();
    if (!d || this.done()) return false;
    return d < new Date().toISOString().split('T')[0];
  }
}
