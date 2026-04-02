import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Calendar, Flag, Tag, AlignLeft, ChevronDown } from 'lucide-angular';

export interface TaskDetailData {
  title: string;
  description: string | null;
  priority: 'none' | 'low' | 'medium' | 'high';
  dueDate: string | null;
  tags: string[];
}

@Component({
  selector: 'ds-task-detail-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './task-detail-sheet.component.html',
  styleUrl: './task-detail-sheet.component.scss',
})
export class TaskDetailSheetComponent {
  open = input(false);
  title = input('');
  description = input<string | null>(null);
  priority = input<'none' | 'low' | 'medium' | 'high'>('none');
  dueDate = input<string | null>(null);
  tags = input<string[]>([]);

  closed = output<void>();
  saved = output<TaskDetailData>();

  // Local editing state
  editTitle = signal('');
  editDescription = signal('');
  editPriority = signal<'none' | 'low' | 'medium' | 'high'>('none');
  editDueDate = signal('');
  editTags = signal<string[]>([]);
  tagInput = signal('');
  showPriorityPicker = signal(false);

  protected readonly xIcon = X;
  protected readonly calendarIcon = Calendar;
  protected readonly flagIcon = Flag;
  protected readonly tagIcon = Tag;
  protected readonly descIcon = AlignLeft;
  protected readonly chevronDown = ChevronDown;

  priorities = [
    { value: 'none' as const, label: 'None', color: '' },
    { value: 'low' as const, label: 'Low', color: 'var(--color-dark-accent-sage)' },
    { value: 'medium' as const, label: 'Medium', color: 'var(--color-dark-accent-gold)' },
    { value: 'high' as const, label: 'High', color: 'var(--color-dark-accent-peach)' },
  ];

  currentPriorityLabel = computed(() =>
    this.priorities.find((p) => p.value === this.editPriority())?.label ?? 'None',
  );

  currentPriorityColor = computed(() =>
    this.priorities.find((p) => p.value === this.editPriority())?.color ?? '',
  );

  constructor() {
    // Sync inputs to edit state when sheet opens
    effect(() => {
      if (this.open()) {
        this.editTitle.set(this.title());
        this.editDescription.set(this.description() || '');
        this.editPriority.set(this.priority());
        this.editDueDate.set(this.dueDate() || '');
        this.editTags.set([...this.tags()]);
        this.tagInput.set('');
        this.showPriorityPicker.set(false);
      }
    });
  }

  onSave() {
    this.saved.emit({
      title: this.editTitle().trim(),
      description: this.editDescription().trim() || null,
      priority: this.editPriority(),
      dueDate: this.editDueDate() || null,
      tags: this.editTags(),
    });
    this.closed.emit();
  }

  onClose() {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('sheet__overlay')) {
      this.onSave();
    }
  }

  setPriority(value: 'none' | 'low' | 'medium' | 'high') {
    this.editPriority.set(value);
    this.showPriorityPicker.set(false);
  }

  addTag() {
    const tag = this.tagInput().trim();
    if (tag && !this.editTags().includes(tag)) {
      this.editTags.set([...this.editTags(), tag]);
    }
    this.tagInput.set('');
  }

  removeTag(tag: string) {
    this.editTags.set(this.editTags().filter((t) => t !== tag));
  }

  onTagKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }
}
