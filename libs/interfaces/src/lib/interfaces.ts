export enum UserRole {
  User = 'User',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
}

export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthTokens {
  accessToken: string;
  xsrfToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ISignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IAuthResponse {
  user: IUser;
  tokens: IAuthTokens;
}

export interface IApiError {
  statusCode: number;
  message: string;
  error?: string;
  code?: string;
}

// Task interfaces
export enum TaskStatus {
  Todo = 'todo',
  Done = 'done',
}

export enum TaskPriority {
  None = 'none',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum RecurrenceFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

export interface IRecurrenceRule {
  frequency: RecurrenceFrequency;
  dayOfWeek?: number;   // 0=Sun..6=Sat (for weekly)
  dayOfMonth?: number;  // 1-31 (for monthly)
}

export interface ITask {
  id: number;
  title: string;
  description: string | null;
  notes: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  scheduledDate: string | null;  // which day to focus on this task, null = backlog
  position: number;
  prerequisiteIds: number[];     // IDs of tasks that must be done before this one
  isBlocked: boolean;            // computed by API: true if any prerequisite is not done
  recurrenceRule: IRecurrenceRule | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTaskRequest {
  title: string;
  description?: string;
  notes?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
  scheduledDate?: string;  // null/omitted = backlog
  recurrenceRule?: IRecurrenceRule;
}

export interface IUpdateTaskRequest {
  title?: string;
  description?: string;
  notes?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
  scheduledDate?: string | null;
  position?: number;
  prerequisiteIds?: number[];
  recurrenceRule?: IRecurrenceRule | null;
}

export interface IReorderTasksRequest {
  taskIds: number[];
}
