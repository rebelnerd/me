import { Component, inject, signal, effect, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { VoiceButtonComponent } from '@app/design-system';
import { ToastService } from '@app/design-system';
import { TasksActions } from '../store/tasks/tasks.actions';
import { SpeechRecognitionService } from './speech-recognition.service';
import { TaskPriority } from '@app/interfaces';
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

  inputRef = viewChild<ElementRef>('taskInput');

  expandIcon = ChevronDown;
  collapseIcon = ChevronUp;

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

    this.store.dispatch(TasksActions.captureTask({
      title,
      description: this.description().trim() || undefined,
      notes: this.notes().trim() || undefined,
      priority: this.priority() !== TaskPriority.None ? this.priority() : undefined,
      dueDate: this.dueDate() || undefined,
    }));

    this.taskTitle.set('');
    this.description.set('');
    this.notes.set('');
    this.priority.set(TaskPriority.None);
    this.dueDate.set('');
    this.tags.set([]);
    this.tagInput.set('');
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
