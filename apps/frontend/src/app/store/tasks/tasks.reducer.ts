import { createReducer, on } from '@ngrx/store';
import { TasksActions } from './tasks.actions';
import { TasksState, initialTasksState } from './tasks.state';
import { TaskStatus } from '@app/interfaces';

export const tasksReducer = createReducer(
  initialTasksState,

  // Load daily tasks
  on(TasksActions.loadDailyTasks, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TasksActions.loadDailyTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    loading: false,
  })),
  on(TasksActions.loadDailyTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load backlog
  on(TasksActions.loadBacklogSuccess, (state, { tasks }) => ({
    ...state,
    backlog: tasks,
  })),

  // Load focus task
  on(TasksActions.loadFocusTask, (state) => ({
    ...state,
    loading: true,
  })),
  on(TasksActions.loadFocusTaskSuccess, (state, { task }) => ({
    ...state,
    focusTask: task,
    loading: false,
  })),
  on(TasksActions.loadFocusTaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Capture task (goes to backlog by default)
  on(TasksActions.captureTask, (state) => ({
    ...state,
    capturing: true,
  })),
  on(TasksActions.captureTaskSuccess, (state, { task }) => ({
    ...state,
    backlog: [task, ...state.backlog],
    capturing: false,
  })),
  on(TasksActions.captureTaskFailure, (state, { error }) => ({
    ...state,
    capturing: false,
    error,
  })),

  // Complete task (optimistic)
  on(TasksActions.completeTask, (state, { id }) => ({
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === id ? { ...t, status: TaskStatus.Done } : t,
    ),
  })),
  on(TasksActions.completeTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
  })),

  // Update task
  on(TasksActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    backlog: state.backlog.map((t) => (t.id === task.id ? task : t)),
    focusTask: state.focusTask?.id === task.id ? task : state.focusTask,
  })),

  // Delete task
  on(TasksActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((t) => t.id !== id),
    backlog: state.backlog.filter((t) => t.id !== id),
  })),

  // Schedule task: move from backlog to today
  on(TasksActions.scheduleTaskSuccess, (state, { task }) => ({
    ...state,
    backlog: state.backlog.filter((t) => t.id !== task.id),
    tasks: [...state.tasks, task],
  })),

  // Unschedule task: move from today to backlog
  on(TasksActions.unscheduleTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.filter((t) => t.id !== task.id),
    backlog: [task, ...state.backlog],
  })),

  // Bounce task (optimistic - remove from today)
  on(TasksActions.bounceTask, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((t) => t.id !== id),
    focusTask: state.focusTask?.id === id ? null : state.focusTask,
  })),

  // Reorder tasks (optimistic)
  on(TasksActions.reorderTasks, (state, { taskIds }) => {
    const reordered = taskIds
      .map((id, index) => {
        const task = state.tasks.find((t) => t.id === id);
        return task ? { ...task, position: index } : null;
      })
      .filter(Boolean) as typeof state.tasks;
    return { ...state, tasks: reordered };
  }),
  on(TasksActions.reorderTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
  })),

  // Set selected date
  on(TasksActions.setSelectedDate, (state, { date }) => ({
    ...state,
    selectedDate: date,
  })),
);
