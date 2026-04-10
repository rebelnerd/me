import { Component, inject, signal, effect, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { VoiceButtonComponent } from '@app/design-system';
import { ToastService } from '@app/design-system';
import { TasksActions } from '../store/tasks/tasks.actions';
import { SpeechRecognitionService } from './speech-recognition.service';
import { TaskPriority, RecurrenceFrequency, IRecurrenceRule } from '@app/interfaces';
import { LucideAngularModule, ChevronDown, ChevronUp } from 'lucide-angular';

@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [CommonModule, FormsModule, VoiceButtonComponent, LucideAngularModule],
  templateUrl: './capture.component.html',
  styleUrl: './capture.component.scss',
})
export class CaptureComponent implements AfterViewInit {
  private store = inject(Store);
  private toast = inject(ToastService);
  speechService = inject(SpeechRecognitionService);

  taskTitle = signal('');
  expanded = signal(false);
  description = signal('');
  notes = signal('');
  priority = signal<TaskPriority>(TaskPriority.None);
  dueDate = signal('');
  tags = signal<string[]>([]);
  tagInput = signal('');
  recurrenceFrequency = signal<RecurrenceFrequency | null>(null);
  recurrenceDayOfWeek = signal(0);
  recurrenceDayOfMonth = signal(1);

  inputRef = viewChild<ElementRef>('taskInput');

  expandIcon = ChevronDown;
  collapseIcon = ChevronUp;
  RecurrenceFrequency = RecurrenceFrequency;

  recurrenceOptions = [
    { value: null as RecurrenceFrequency | null, label: 'None' },
    { value: RecurrenceFrequency.Daily, label: 'Daily' },
    { value: RecurrenceFrequency.Weekly, label: 'Weekly' },
    { value: RecurrenceFrequency.Monthly, label: 'Monthly' },
  ];

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
    { value: TaskPriority.None, label: 'None' },
    { value: TaskPriority.Low, label: 'Low', color: 'var(--color-dark-accent-sage)' },
    { value: TaskPriority.Medium, label: 'Medium', color: 'var(--color-dark-accent-gold)' },
    { value: TaskPriority.High, label: 'High', color: 'var(--color-dark-accent-peach)' },
  ];

  constructor() {
    effect(() => {
      const transcript = this.speechService.transcript();
      if (transcript) {
        this.taskTitle.set(transcript);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.inputRef()?.nativeElement?.focus(), 100);
  }

  toggleExpand() {
    this.expanded.set(!this.expanded());
  }

  addTag() {
    const tag = this.tagInput().trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.set([...this.tags(), tag]);
    }
    this.tagInput.set('');
  }

  removeTag(tag: string) {
    this.tags.set(this.tags().filter((t) => t !== tag));
  }

  onTagKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  onSubmit() {
    const title = this.taskTitle().trim();
    if (!title) return;

    let recurrenceRule: IRecurrenceRule | undefined;
    const freq = this.recurrenceFrequency();
    if (freq) {
      recurrenceRule = { frequency: freq };
      if (freq === RecurrenceFrequency.Weekly) {
        recurrenceRule.dayOfWeek = this.recurrenceDayOfWeek();
      }
      if (freq === RecurrenceFrequency.Monthly) {
        recurrenceRule.dayOfMonth = this.recurrenceDayOfMonth();
      }
    }

    this.store.dispatch(TasksActions.captureTask({
      title,
      description: this.description().trim() || undefined,
      notes: this.notes().trim() || undefined,
      priority: this.priority() !== TaskPriority.None ? this.priority() : undefined,
      dueDate: this.dueDate() || undefined,
      recurrenceRule,
    }));

    this.taskTitle.set('');
    this.description.set('');
    this.notes.set('');
    this.priority.set(TaskPriority.None);
    this.dueDate.set('');
    this.tags.set([]);
    this.tagInput.set('');
    this.recurrenceFrequency.set(null);
    this.recurrenceDayOfWeek.set(0);
    this.recurrenceDayOfMonth.set(1);
    this.speechService.transcript.set('');
    this.toast.success('Task added');

    setTimeout(() => this.inputRef()?.nativeElement?.focus(), 50);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.expanded()) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
