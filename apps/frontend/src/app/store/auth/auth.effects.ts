import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { AuthActions } from './auth.actions';
import { AuthApiService } from './auth.service';

@Injectable()
export class AuthEffects implements OnInitEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthApiService,
    private router: Router,
  ) {}

  ngrxOnInitEffects(): Action {
    const token = localStorage.getItem('authToken');
    if (token) {
      return AuthActions.getMe();
    }
    return AuthActions.logoutSuccess();
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
          catchError((error) => of(AuthActions.getMeFailure({ error: error.message }))),
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
}
