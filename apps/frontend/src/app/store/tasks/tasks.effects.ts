import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TasksActions } from './tasks.actions';
import { TasksApiService } from './tasks.service';
import { selectSelectedDate } from './tasks.selectors';
import { TaskStatus } from '@app/interfaces';

@Injectable()
export class TasksEffects {
  private actions$ = inject(Actions);
  private tasksService = inject(TasksApiService);
  private store = inject(Store);

  loadDailyTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadDailyTasks),
      exhaustMap(({ date }) =>
        this.tasksService.getDailyTasks(date).pipe(
          map((tasks) => TasksActions.loadDailyTasksSuccess({ tasks })),
          catchError((error) =>
            of(TasksActions.loadDailyTasksFailure({ error: error.error?.message || 'Failed to load tasks' })),
          ),
        ),
      ),
    ),
  );

  loadBacklog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadBacklog),
      exhaustMap(() =>
        this.tasksService.getBacklog().pipe(
          map((tasks) => TasksActions.loadBacklogSuccess({ tasks })),
          catchError((error) =>
            of(TasksActions.loadBacklogFailure({ error: error.error?.message || 'Failed to load backlog' })),
          ),
        ),
      ),
    ),
  );

  loadFocusTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadFocusTask),
      exhaustMap(({ date }) =>
        this.tasksService.getFocusTask(date).pipe(
          map((task) => TasksActions.loadFocusTaskSuccess({ task })),
          catchError((error) =>
            of(TasksActions.loadFocusTaskFailure({ error: error.error?.message || 'Failed to load focus task' })),
          ),
        ),
      ),
    ),
  );

  captureTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.captureTask),
      exhaustMap(({ title, notes, description, priority, dueDate, recurrenceRule }) =>
        this.tasksService.createTask({ title, notes, description, priority, dueDate, recurrenceRule }).pipe(
          map((task) => TasksActions.captureTaskSuccess({ task })),
          catchError((error) =>
            of(TasksActions.captureTaskFailure({ error: error.error?.message || 'Failed to create task' })),
          ),
        ),
      ),
    ),
  );

  completeTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.completeTask),
      exhaustMap(({ id }) =>
        this.tasksService.updateTask(id, { status: TaskStatus.Done }).pipe(
          map((task) => TasksActions.completeTaskSuccess({ task })),
          catchError((error) =>
            of(TasksActions.completeTaskFailure({ error: error.error?.message || 'Failed to complete task' })),
          ),
        ),
      ),
    ),
  );

  completeTaskReload$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.completeTaskSuccess),
      withLatestFrom(this.store.select(selectSelectedDate)),
      switchMap(([, date]) => [
        TasksActions.loadFocusTask({ date }),
        TasksActions.loadDailyTasks({ date }),
      ]),
    ),
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTask),
      exhaustMap(({ id, changes }) =>
        this.tasksService.updateTask(id, changes).pipe(
          map((task) => TasksActions.updateTaskSuccess({ task })),
          catchError((error) =>
            of(TasksActions.updateTaskFailure({ error: error.error?.message || 'Failed to update task' })),
          ),
        ),
      ),
    ),
  );

  updateTaskSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTaskSuccess),
      withLatestFrom(this.store.select(selectSelectedDate)),
      switchMap(([, date]) => [
        TasksActions.loadDailyTasks({ date }),
        TasksActions.loadBacklog({}),
        TasksActions.loadFocusTask({ date }),
      ]),
    ),
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      exhaustMap(({ id }) =>
        this.tasksService.deleteTask(id).pipe(
          map(() => TasksActions.deleteTaskSuccess({ id })),
          catchError((error) =>
            of(TasksActions.deleteTaskFailure({ error: error.error?.message || 'Failed to delete task' })),
          ),
        ),
      ),
    ),
  );

  scheduleTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.scheduleTask),
      exhaustMap(({ id, date }) =>
        this.tasksService.scheduleTask(id, date).pipe(
          map((task) => TasksActions.scheduleTaskSuccess({ task })),
          catchError((error) =>
            of(TasksActions.scheduleTaskFailure({ error: error.error?.message || 'Failed to schedule task' })),
          ),
        ),
      ),
    ),
  );

  unscheduleTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.unscheduleTask),
      exhaustMap(({ id }) =>
        this.tasksService.unscheduleTask(id).pipe(
          map((task) => TasksActions.unscheduleTaskSuccess({ task })),
          catchError((error) =>
            of(TasksActions.unscheduleTaskFailure({ error: error.error?.message || 'Failed to unschedule task' })),
          ),
        ),
      ),
    ),
  );

  bounceTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.bounceTask),
      exhaustMap(({ id }) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        return this.tasksService.scheduleTask(id, tomorrowStr).pipe(
          map((task) => TasksActions.bounceTaskSuccess({ task })),
          catchError((error) =>
            of(TasksActions.bounceTaskFailure({ error: error.error?.message || 'Failed to bounce task' })),
          ),
        );
      }),
    ),
  );

  bounceTaskSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.bounceTaskSuccess),
      withLatestFrom(this.store.select(selectSelectedDate)),
      map(([, date]) => TasksActions.loadFocusTask({ date })),
    ),
  );

  reorderTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.reorderTasks),
      exhaustMap(({ taskIds, date }) =>
        this.tasksService.reorderTasks(date, taskIds).pipe(
          map((tasks) => TasksActions.reorderTasksSuccess({ tasks })),
          catchError((error) =>
            of(TasksActions.reorderTasksFailure({ error: error.error?.message || 'Failed to reorder tasks' })),
          ),
        ),
      ),
    ),
  );

  reorderTasksReloadFocus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.reorderTasksSuccess),
      withLatestFrom(this.store.select(selectSelectedDate)),
      map(([, date]) => TasksActions.loadFocusTask({ date })),
    ),
  );
}
