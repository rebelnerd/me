import { createActionGroup, props } from '@ngrx/store';
import { ITask, IUpdateTaskRequest, TaskPriority } from '@app/interfaces';

export const TasksActions = createActionGroup({
  source: '[Tasks]',
  events: {
    LoadDailyTasks: props<{ date: string }>(),
    LoadDailyTasksSuccess: props<{ tasks: ITask[] }>(),
    LoadDailyTasksFailure: props<{ error: string }>(),

    LoadBacklog: props<Record<string, never>>(),
    LoadBacklogSuccess: props<{ tasks: ITask[] }>(),
    LoadBacklogFailure: props<{ error: string }>(),

    LoadFocusTask: props<{ date: string }>(),
    LoadFocusTaskSuccess: props<{ task: ITask | null }>(),
    LoadFocusTaskFailure: props<{ error: string }>(),

    CaptureTask: props<{ title: string; notes?: string; description?: string; priority?: TaskPriority; dueDate?: string }>(),
    CaptureTaskSuccess: props<{ task: ITask }>(),
    CaptureTaskFailure: props<{ error: string }>(),

    CompleteTask: props<{ id: number }>(),
    CompleteTaskSuccess: props<{ task: ITask }>(),
    CompleteTaskFailure: props<{ error: string }>(),

    UpdateTask: props<{ id: number; changes: IUpdateTaskRequest }>(),
    UpdateTaskSuccess: props<{ task: ITask }>(),
    UpdateTaskFailure: props<{ error: string }>(),

    DeleteTask: props<{ id: number }>(),
    DeleteTaskSuccess: props<{ id: number }>(),
    DeleteTaskFailure: props<{ error: string }>(),

    ScheduleTask: props<{ id: number; date: string }>(),
    ScheduleTaskSuccess: props<{ task: ITask }>(),
    ScheduleTaskFailure: props<{ error: string }>(),

    UnscheduleTask: props<{ id: number }>(),
    UnscheduleTaskSuccess: props<{ task: ITask }>(),
    UnscheduleTaskFailure: props<{ error: string }>(),

    BounceTask: props<{ id: number }>(),
    BounceTaskSuccess: props<{ task: ITask }>(),
    BounceTaskFailure: props<{ error: string }>(),

    ReorderTasks: props<{ taskIds: number[]; date: string }>(),
    ReorderTasksSuccess: props<{ tasks: ITask[] }>(),
    ReorderTasksFailure: props<{ error: string }>(),

    SetSelectedDate: props<{ date: string }>(),
  },
});
