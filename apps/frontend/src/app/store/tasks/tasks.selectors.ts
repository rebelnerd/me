import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState } from './tasks.state';
import { TaskStatus } from '@app/interfaces';

export const selectTasksState = createFeatureSelector<TasksState>('tasks');

export const selectTasks = createSelector(
  selectTasksState,
  (state) => state.tasks,
);

export const selectBacklog = createSelector(
  selectTasksState,
  (state) => state.backlog,
);

export const selectFocusTask = createSelector(
  selectTasksState,
  (state) => state.focusTask,
);

export const selectSelectedDate = createSelector(
  selectTasksState,
  (state) => state.selectedDate,
);

export const selectTasksLoading = createSelector(
  selectTasksState,
  (state) => state.loading,
);

export const selectCapturing = createSelector(
  selectTasksState,
  (state) => state.capturing,
);

export const selectTodoTasks = createSelector(
  selectTasks,
  (tasks) => tasks.filter((t) => t.status === TaskStatus.Todo),
);

export const selectDoneTasks = createSelector(
  selectTasks,
  (tasks) => tasks.filter((t) => t.status === TaskStatus.Done),
);

export const selectTasksError = createSelector(
  selectTasksState,
  (state) => state.error,
);

/**
 * Get all tasks (scheduled + backlog) as a lookup map by id.
 * Useful for resolving prerequisite titles.
 */
export const selectAllTasksMap = createSelector(
  selectTasks,
  selectBacklog,
  (tasks, backlog) => {
    const map = new Map<number, typeof tasks[number]>();
    for (const t of tasks) map.set(t.id, t);
    for (const t of backlog) map.set(t.id, t);
    return map;
  },
);
