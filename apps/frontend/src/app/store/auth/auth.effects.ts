import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { of, EMPTY } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AuthActions } from './auth.actions';
import { selectCurrentUser } from './auth.selectors';
import { AuthApiService } from './auth.service';

@Injectable()
export class AuthEffects implements OnInitEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthApiService);
  private router = inject(Router);
  private store = inject(Store);

  ngrxOnInitEffects(): Action {
    const token = localStorage.getItem('authToken');
    if (token) {
      return AuthActions.getMe();
    }
    // No token in localStorage — try refreshing via httpOnly cookie
    // (handles "remember me" sessions where localStorage was cleared)
    return AuthActions.refreshToken();
  }

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password, rememberMe }) =>
        this.authService.login({ email, password, rememberMe }).pipe(
          map((response) => {
            localStorage.setItem('authToken', response.tokens.accessToken);
            return AuthActions.loginSuccess({
              user: response.user,
              accessToken: response.tokens.accessToken,
              xsrfToken: response.tokens.xsrfToken,
            });
          }),
          catchError((error) =>
            of(
              AuthActions.loginFailure({
                error: error.error?.message || 'Login failed',
                code: error.error?.code,
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(['/'])),
      ),
    { dispatch: false },
  );

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signup),
      exhaustMap(({ email, password, firstName, lastName }) =>
        this.authService.signup({ email, password, firstName, lastName }).pipe(
          map((response) => {
            localStorage.setItem('authToken', response.tokens.accessToken);
            return AuthActions.signupSuccess({
              user: response.user,
              accessToken: response.tokens.accessToken,
              xsrfToken: response.tokens.xsrfToken,
            });
          }),
          catchError((error) =>
            of(AuthActions.signupFailure({ error: error.error?.message || 'Signup failed' })),
          ),
        ),
      ),
    ),
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => {
            localStorage.removeItem('authToken');
            return AuthActions.logoutSuccess();
          }),
          catchError(() => {
            localStorage.removeItem('authToken');
            return of(AuthActions.logoutSuccess());
          }),
        ),
      ),
    ),
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => this.router.navigate(['/auth/login'])),
      ),
    { dispatch: false },
  );

  getMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.getMe),
      exhaustMap(() =>
        this.authService.getMe().pipe(
          map((user) => AuthActions.getMeSuccess({ user })),
          catchError(() =>
            // Access token expired — try refreshing via httpOnly cookie
            this.authService.refreshToken().pipe(
              switchMap((tokens) => {
                localStorage.setItem('authToken', tokens.accessToken);
                return this.authService.getMe().pipe(
                  map((user) =>
                    AuthActions.getMeSuccess({
                      user,
                      accessToken: tokens.accessToken,
                      xsrfToken: tokens.xsrfToken,
                    }),
                  ),
                );
              }),
              catchError((error) => of(AuthActions.getMeFailure({ error: error.message }))),
            ),
          ),
        ),
      ),
    ),
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      exhaustMap(() =>
        this.authService.refreshToken().pipe(
          map((tokens) => {
            localStorage.setItem('authToken', tokens.accessToken);
            return AuthActions.refreshTokenSuccess(tokens);
          }),
          catchError(() => of(AuthActions.refreshTokenFailure())),
        ),
      ),
    ),
  );

  // After a successful token refresh, load the user if not already loaded
  loadUserAfterRefresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenSuccess),
      withLatestFrom(this.store.select(selectCurrentUser)),
      switchMap(([, user]) => {
        if (!user) {
          return of(AuthActions.getMe());
        }
        return EMPTY;
      }),
    ),
  );
}
