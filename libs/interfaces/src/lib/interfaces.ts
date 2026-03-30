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
