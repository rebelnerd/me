import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { FocusCardComponent, ProgressDotsComponent, TaskDetailSheetComponent, TaskDetailData, ToastService } from '@app/design-system';
import { TasksActions } from '../store/tasks/tasks.actions';
import {
  selectFocusTask,
  selectTasks,
  selectTodoTasks,
  selectDoneTasks,
  selectTasksLoading,
} from '../store/tasks/tasks.selectors';
import { TaskPriority } from '@app/interfaces';
import { CheckCircle, ArrowRight } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [CommonModule, FocusCardComponent, ProgressDotsComponent, TaskDetailSheetComponent, LucideAngularModule],
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.scss',
})
export class FocusComponent implements OnInit {
  private store = inject(Store);
  private toast = inject(ToastService);

  focusTask = toSignal(this.store.select(selectFocusTask));
  allTasks = toSignal(this.store.select(selectTasks), { initialValue: [] });
  todoTasks = toSignal(this.store.select(selectTodoTasks), { initialValue: [] });
  doneTasks = toSignal(this.store.select(selectDoneTasks), { initialValue: [] });
  loading = toSignal(this.store.select(selectTasksLoading), { initialValue: false });

  completing = signal(false);
  detailOpen = signal(false);

  checkCircleIcon = CheckCircle;
  arrowRightIcon = ArrowRight;

  totalTasks = computed(() => this.allTasks().length);
  doneCount = computed(() => this.doneTasks().length);
  currentIndex = computed(() => {
    const task = this.focusTask();
    if (!task) return 0;
    return this.allTasks().findIndex((t) => t.id === task.id);
  });

  progressText = computed(() => {
    const done = this.doneCount();
    const total = this.totalTasks();
    if (total === 0) return '';
    return `${done} of ${total}`;
  });

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.store.dispatch(TasksActions.loadFocusTask({ date: today }));
    this.store.dispatch(TasksActions.loadDailyTasks({ date: today }));
  }

  openDetail() {
    if (this.focusTask()) {
      this.detailOpen.set(true);
    }
  }

  onDetailSaved(data: TaskDetailData) {
    const task = this.focusTask();
    if (!task) return;
    this.store.dispatch(TasksActions.updateTask({
      id: task.id,
      changes: {
        title: data.title,
        description: data.description ?? undefined,
        priority: data.priority as TaskPriority,
        dueDate: data.dueDate,
        tags: data.tags,
      },
    }));
  }

  onDetailClosed() {
    this.detailOpen.set(false);
  }

  bounceTask() {
    const task = this.focusTask();
    if (!task || this.completing()) return;

    this.completing.set(true);

    setTimeout(() => {
      this.store.dispatch(TasksActions.bounceTask({ id: task.id }));
      this.toast.info(`"${task.title}" bounced to tomorrow`, 2500);
      this.completing.set(false);
    }, 300);
  }

  completeTask() {
    const task = this.focusTask();
    if (!task || this.completing()) return;

    this.completing.set(true);

    setTimeout(() => {
      this.store.dispatch(TasksActions.completeTask({ id: task.id }));
      this.completing.set(false);
    }, 300);
  }
}
