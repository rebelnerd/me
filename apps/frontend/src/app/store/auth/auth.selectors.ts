import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthInitialized = createSelector(
  selectAuthState,
  (state) => state.initialized,
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated,
);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user,
);

export const selectAuthToken = createSelector(
  selectAuthState,
  (state) => state.token,
);

export const selectXsrfToken = createSelector(
  selectAuthState,
  (state) => state.xsrfToken,
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading,
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error,
);

export const selectAuthErrorCode = createSelector(
  selectAuthState,
  (state) => state.errorCode,
);

export const selectUserRole = createSelector(
  selectCurrentUser,
  (user) => user?.role ?? null,
);
