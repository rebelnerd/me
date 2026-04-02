import { IUser } from '@app/interfaces';

export interface AuthState {
  initialized: boolean;
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
  xsrfToken: string | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
}

export const initialAuthState: AuthState = {
  initialized: false,
  isAuthenticated: false,
  user: null,
  token: null,
  xsrfToken: null,
  loading: false,
  error: null,
  errorCode: null,
};
