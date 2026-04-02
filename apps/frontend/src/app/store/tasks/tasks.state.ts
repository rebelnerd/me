import { ITask } from '@app/interfaces';

export interface TasksState {
  tasks: ITask[];           // today's scheduled tasks
  backlog: ITask[];         // unscheduled tasks
  focusTask: ITask | null;
  selectedDate: string;
  loading: boolean;
  capturing: boolean;
  error: string | null;
}

export const initialTasksState: TasksState = {
  tasks: [],
  backlog: [],
  focusTask: null,
  selectedDate: new Date().toISOString().split('T')[0],
  loading: false,
  capturing: false,
  error: null,
};
