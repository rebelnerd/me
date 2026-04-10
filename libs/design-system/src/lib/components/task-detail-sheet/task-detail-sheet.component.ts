import { Component, input, output, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Calendar, CalendarClock, Flag, Tag, AlignLeft, ChevronDown, Lock, Search, Repeat } from 'lucide-angular';
import { IRecurrenceRule, RecurrenceFrequency } from '@app/interfaces';

export interface PrerequisiteRef {
  id: number;
  title: string;
}

export interface TaskDetailData {
  title: string;
  description: string | null;
  priority: 'none' | 'low' | 'medium' | 'high';
  dueDate: string | null;
  scheduledDate: string | null;
  tags: string[];
  prerequisiteIds: number[];
  recurrenceRule: IRecurrenceRule | null;
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
  scheduledDate = input<string | null>(null);
  tags = input<string[]>([]);
  recurrenceRule = input<IRecurrenceRule | null>(null);
  prerequisites = input<PrerequisiteRef[]>([]);
  prerequisiteSearchResults = input<PrerequisiteRef[]>([]);

  closed = output<void>();
  saved = output<TaskDetailData>();
  prerequisiteSearch = output<string>();

  // Local editing state
  editTitle = signal('');
  editDescription = signal('');
  editPriority = signal<'none' | 'low' | 'medium' | 'high'>('none');
  editDueDate = signal('');
  editScheduledDate = signal('');
  editTags = signal<string[]>([]);
  editRecurrenceFrequency = signal<RecurrenceFrequency | null>(null);
  editRecurrenceDayOfWeek = signal(0);
  editRecurrenceDayOfMonth = signal(1);
  showRecurrencePicker = signal(false);
  editPrerequisites = signal<PrerequisiteRef[]>([]);
  tagInput = signal('');
  showPriorityPicker = signal(false);
  showPrerequisites = signal(false);
  prereqSearchInput = signal('');

  protected readonly xIcon = X;
  protected readonly calendarIcon = Calendar;
  protected readonly calendarClockIcon = CalendarClock;
  protected readonly flagIcon = Flag;
  protected readonly tagIcon = Tag;
  protected readonly descIcon = AlignLeft;
  protected readonly chevronDown = ChevronDown;
  protected readonly lockIcon = Lock;
  protected readonly searchIcon = Search;
  protected readonly repeatIcon = Repeat;

  protected readonly RecurrenceFrequency = RecurrenceFrequency;

  daysOfWeek = [
    { value: 0, label: 'S' },
    { value: 1, label: 'M' },
    { value: 2, label: 'T' },
    { value: 3, label: 'W' },
    { value: 4, label: 'T' },
    { value: 5, label: 'F' },
    { value: 6, label: 'S' },
  ];

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

  recurrenceLabel = computed(() => {
    const freq = this.editRecurrenceFrequency();
    if (!freq) return 'None';
    switch (freq) {
      case RecurrenceFrequency.Daily:
        return 'Every day';
      case RecurrenceFrequency.Weekly: {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Every ${dayNames[this.editRecurrenceDayOfWeek()]}`;
      }
      case RecurrenceFrequency.Monthly:
        return `Monthly on the ${this.ordinal(this.editRecurrenceDayOfMonth())}`;
    }
  });

  editRecurrenceRule = computed<IRecurrenceRule | null>(() => {
    const freq = this.editRecurrenceFrequency();
    if (!freq) return null;
    const rule: IRecurrenceRule = { frequency: freq };
    if (freq === RecurrenceFrequency.Weekly) {
      rule.dayOfWeek = this.editRecurrenceDayOfWeek();
    }
    if (freq === RecurrenceFrequency.Monthly) {
      rule.dayOfMonth = this.editRecurrenceDayOfMonth();
    }
    return rule;
  });

  prereqLabel = computed(() => {
    const count = this.editPrerequisites().length;
    if (count === 0) return 'Add prerequisites...';
    return `${count} prerequisite${count > 1 ? 's' : ''}`;
  });

  filteredSearchResults = computed(() => {
    const currentIds = new Set(this.editPrerequisites().map((p) => p.id));
    return this.prerequisiteSearchResults().filter((r) => !currentIds.has(r.id));
  });

  constructor() {
    // Sync inputs to edit state when sheet opens.
    // Only track `open()` — read other inputs via untracked() so
    // changes to parent-bound arrays don't reset edit state mid-edit.
    effect(() => {
      if (this.open()) {
        untracked(() => {
          this.editTitle.set(this.title());
          this.editDescription.set(this.description() || '');
          this.editPriority.set(this.priority());
          this.editDueDate.set(this.dueDate()?.substring(0, 10) || '');
          this.editScheduledDate.set(this.scheduledDate()?.substring(0, 10) || '');
          this.editTags.set([...this.tags()]);
          this.editPrerequisites.set([...this.prerequisites()]);
          const rule = this.recurrenceRule();
          this.editRecurrenceFrequency.set(rule?.frequency ?? null);
          this.editRecurrenceDayOfWeek.set(rule?.dayOfWeek ?? 0);
          this.editRecurrenceDayOfMonth.set(rule?.dayOfMonth ?? 1);
          this.showRecurrencePicker.set(false);
          this.tagInput.set('');
          this.prereqSearchInput.set('');
          this.showPriorityPicker.set(false);
          this.showPrerequisites.set(this.prerequisites().length > 0);
        });
      }
    });
  }

  onSave() {
    this.saved.emit({
      title: this.editTitle().trim(),
      description: this.editDescription().trim() || null,
      priority: this.editPriority(),
      dueDate: this.editDueDate() || null,
      scheduledDate: this.editScheduledDate() || null,
      tags: this.editTags(),
      prerequisiteIds: this.editPrerequisites().map((p) => p.id),
      recurrenceRule: this.editRecurrenceRule(),
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

  onPrereqSearchInput(value: string) {
    this.prereqSearchInput.set(value);
    if (value.trim().length >= 2) {
      this.prerequisiteSearch.emit(value.trim());
    }
  }

  addPrerequisite(ref: PrerequisiteRef) {
    if (!this.editPrerequisites().find((p) => p.id === ref.id)) {
      this.editPrerequisites.set([...this.editPrerequisites(), ref]);
    }
    this.prereqSearchInput.set('');
  }

  removePrerequisite(id: number) {
    this.editPrerequisites.set(this.editPrerequisites().filter((p) => p.id !== id));
  }

  setRecurrenceFrequency(freq: RecurrenceFrequency | null) {
    this.editRecurrenceFrequency.set(freq);
    if (!freq) {
      this.showRecurrencePicker.set(false);
    }
  }

  private ordinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
}
