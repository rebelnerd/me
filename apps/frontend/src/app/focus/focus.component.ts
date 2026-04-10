import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { FocusCardComponent, ProgressDotsComponent, TaskDetailSheetComponent, TaskDetailData, PrerequisiteRef, ToastService } from '@app/design-system';
import { TasksActions } from '../store/tasks/tasks.actions';
import { TasksApiService } from '../store/tasks/tasks.service';
import {
  selectFocusTask,
  selectTasks,
  selectTodoTasks,
  selectDoneTasks,
  selectTasksLoading,
  selectAllTasksMap,
} from '../store/tasks/tasks.selectors';
import { TaskPriority } from '@app/interfaces';
import { CheckCircle, ArrowRight, ArrowDown } from 'lucide-angular';
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
  private tasksApi = inject(TasksApiService);

  focusTask = toSignal(this.store.select(selectFocusTask));
  allTasks = toSignal(this.store.select(selectTasks), { initialValue: [] });
  todoTasks = toSignal(this.store.select(selectTodoTasks), { initialValue: [] });
  doneTasks = toSignal(this.store.select(selectDoneTasks), { initialValue: [] });
  loading = toSignal(this.store.select(selectTasksLoading), { initialValue: false });
  allTasksMap = toSignal(this.store.select(selectAllTasksMap), { initialValue: new Map() });

  completing = signal(false);
  detailOpen = signal(false);
  prereqSearchResults = signal<PrerequisiteRef[]>([]);

  checkCircleIcon = CheckCircle;
  arrowRightIcon = ArrowRight;
  arrowDownIcon = ArrowDown;

  totalTasks = computed(() => this.allTasks().length);
  doneCount = computed(() => this.doneTasks().length);
  currentIndex = computed(() => {
    const task = this.focusTask();
    if (!task) return 0;
    return this.allTasks().findIndex((t) => t.id === task.id);
  });

  progressText = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return '';
    return `${this.currentIndex() + 1} of ${total}`;
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

  getPrerequisiteRefs(): PrerequisiteRef[] {
    const task = this.focusTask();
    if (!task?.prerequisiteIds?.length) return [];
    const map = this.allTasksMap();
    return task.prerequisiteIds
      .map((id) => {
        const t = map.get(id);
        return t ? { id: t.id, title: t.title } : null;
      })
      .filter((r): r is PrerequisiteRef => r !== null);
  }

  onPrereqSearch(query: string) {
    const task = this.focusTask();
    this.tasksApi.searchTasks(query, task?.id).subscribe((results) => {
      this.prereqSearchResults.set(
        results.map((t) => ({ id: t.id, title: t.title })),
      );
    });
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
        scheduledDate: data.scheduledDate,
        tags: data.tags,
        prerequisiteIds: data.prerequisiteIds,
        recurrenceRule: data.recurrenceRule,
      },
    }));
  }

  onDetailClosed() {
    this.detailOpen.set(false);
    this.prereqSearchResults.set([]);
  }

  skipTask() {
    const task = this.focusTask();
    const tasks = this.todoTasks();
    if (!task || this.completing() || tasks.length <= 1) return;

    this.completing.set(true);
    const today = new Date().toISOString().split('T')[0];
    const reordered = [
      ...this.allTasks().filter((t) => t.id !== task.id),
      task,
    ];

    setTimeout(() => {
      this.store.dispatch(TasksActions.reorderTasks({
        taskIds: reordered.map((t) => t.id),
        date: today,
      }));
      this.toast.info(`"${task.title}" moved to later`, 2500);
      this.completing.set(false);
    }, 300);
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
