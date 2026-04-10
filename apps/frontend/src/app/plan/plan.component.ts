import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskRowComponent, IconButtonComponent, TaskDetailSheetComponent, TaskDetailData, PrerequisiteRef, ToastService } from '@app/design-system';
import { TasksActions } from '../store/tasks/tasks.actions';
import { TasksApiService } from '../store/tasks/tasks.service';
import {
  selectTasks,
  selectBacklog,
  selectTodoTasks,
  selectDoneTasks,
  selectSelectedDate,
  selectTasksLoading,
  selectAllTasksMap,
} from '../store/tasks/tasks.selectors';
import { TaskStatus, ITask, TaskPriority } from '@app/interfaces';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, TaskRowComponent, IconButtonComponent, TaskDetailSheetComponent, LucideAngularModule],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.scss',
})
export class PlanComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private toast = inject(ToastService);
  private tasksApi = inject(TasksApiService);

  tasks = toSignal(this.store.select(selectTasks), { initialValue: [] });
  backlog = toSignal(this.store.select(selectBacklog), { initialValue: [] });
  todoTasks = toSignal(this.store.select(selectTodoTasks), { initialValue: [] });
  doneTasks = toSignal(this.store.select(selectDoneTasks), { initialValue: [] });
  selectedDate = toSignal(this.store.select(selectSelectedDate), { initialValue: '' });
  loading = toSignal(this.store.select(selectTasksLoading), { initialValue: false });
  allTasksMap = toSignal(this.store.select(selectAllTasksMap), { initialValue: new Map() });

  chevronLeftIcon = ChevronLeft;
  chevronRightIcon = ChevronRight;
  plusIcon = Plus;
  minusIcon = Minus;

  showBacklog = signal(false);

  // Detail sheet state
  detailOpen = signal(false);
  selectedTask = signal<ITask | null>(null);
  prereqSearchResults = signal<PrerequisiteRef[]>([]);

  displayDate = computed(() => {
    const date = this.selectedDate();
    if (!date) return '';
    const d = new Date(date + 'T12:00:00');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (date === todayStr) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.store.dispatch(TasksActions.setSelectedDate({ date: today }));
    this.store.dispatch(TasksActions.loadDailyTasks({ date: today }));
    this.store.dispatch(TasksActions.loadBacklog({}));
  }

  navigateDate(direction: number) {
    const current = this.selectedDate();
    if (!current) return;
    const d = new Date(current + 'T12:00:00');
    d.setDate(d.getDate() + direction);
    const newDate = d.toISOString().split('T')[0];
    this.store.dispatch(TasksActions.setSelectedDate({ date: newDate }));
    this.store.dispatch(TasksActions.loadDailyTasks({ date: newDate }));
  }

  onTaskToggle(task: ITask) {
    if (task.status === TaskStatus.Done) {
      this.store.dispatch(TasksActions.updateTask({
        id: task.id,
        changes: { status: TaskStatus.Todo },
      }));
    } else {
      this.store.dispatch(TasksActions.completeTask({ id: task.id }));
    }
  }

  onTaskDelete(task: ITask) {
    this.store.dispatch(TasksActions.deleteTask({ id: task.id }));
  }

  onTaskTap(task: ITask) {
    this.selectedTask.set(task);
    this.detailOpen.set(true);
  }

  getPrerequisiteRefs(task: ITask): PrerequisiteRef[] {
    if (!task.prerequisiteIds?.length) return [];
    const map = this.allTasksMap();
    return task.prerequisiteIds
      .map((id) => {
        const t = map.get(id);
        return t ? { id: t.id, title: t.title } : null;
      })
      .filter((r): r is PrerequisiteRef => r !== null);
  }

  onPrereqSearch(query: string) {
    const task = this.selectedTask();
    this.tasksApi.searchTasks(query, task?.id).subscribe((results) => {
      this.prereqSearchResults.set(
        results.map((t) => ({ id: t.id, title: t.title })),
      );
    });
  }

  onDetailSaved(data: TaskDetailData) {
    const task = this.selectedTask();
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
    this.selectedTask.set(null);
    this.prereqSearchResults.set([]);
  }

  scheduleTask(task: ITask) {
    this.store.dispatch(TasksActions.scheduleTask({
      id: task.id,
      date: this.selectedDate(),
    }));
  }

  unscheduleTask(task: ITask) {
    this.store.dispatch(TasksActions.unscheduleTask({ id: task.id }));
  }

  onDrop(event: CdkDragDrop<ITask[]>) {
    const todos = [...this.todoTasks()];
    moveItemInArray(todos, event.previousIndex, event.currentIndex);
    const taskIds = todos.map((t) => t.id);
    this.store.dispatch(TasksActions.reorderTasks({
      taskIds,
      date: this.selectedDate(),
    }));
  }

  bounceTask(task: ITask) {
    this.store.dispatch(TasksActions.bounceTask({ id: task.id }));
    this.toast.info(`"${task.title}" bounced to tomorrow`, 2500);
  }

  goToCapture() {
    this.router.navigate(['/capture']);
  }
}
