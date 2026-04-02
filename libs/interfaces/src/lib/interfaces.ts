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
}

export interface IReorderTasksRequest {
  taskIds: number[];
}
