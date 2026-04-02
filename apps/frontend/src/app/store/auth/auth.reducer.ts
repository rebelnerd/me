import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
    errorCode: null,
  })),
  on(AuthActions.loginSuccess, (state, { user, accessToken, xsrfToken }) => ({
    ...state,
    initialized: true,
    isAuthenticated: true,
    user,
    token: accessToken,
    xsrfToken,
    loading: false,
    error: null,
    errorCode: null,
  })),
  on(AuthActions.loginFailure, (state, { error, code }) => ({
    ...state,
    loading: false,
    error,
    errorCode: code ?? null,
  })),

  // Signup
  on(AuthActions.signup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.signupSuccess, (state, { user, accessToken, xsrfToken }) => ({
    ...state,
    initialized: true,
    isAuthenticated: true,
    user,
    token: accessToken,
    xsrfToken,
    loading: false,
    error: null,
  })),
  on(AuthActions.signupFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Logout
  on(AuthActions.logoutSuccess, () => ({ ...initialAuthState, initialized: true })),

  // Get Me
  on(AuthActions.getMeSuccess, (state, { user, accessToken, xsrfToken }) => ({
    ...state,
    initialized: true,
    isAuthenticated: true,
    user,
    token: accessToken ?? state.token,
    xsrfToken: xsrfToken ?? state.xsrfToken,
  })),
  on(AuthActions.getMeFailure, () => ({ ...initialAuthState, initialized: true })),

  // Refresh Token
  on(AuthActions.refreshTokenSuccess, (state, { accessToken, xsrfToken }) => ({
    ...state,
    token: accessToken,
    xsrfToken,
  })),
  on(AuthActions.refreshTokenFailure, () => ({ ...initialAuthState, initialized: true })),

  // Clear Error
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
    errorCode: null,
  })),
);
