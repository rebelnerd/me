import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAuthToken, selectXsrfToken } from '../../store/auth/auth.selectors';
import { AuthActions } from '../../store/auth/auth.actions';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private token: string | null = null;
  private xsrfToken: string | null = null;

  constructor(private store: Store) {
    this.store.select(selectAuthToken).subscribe((t) => (this.token = t));
    this.store.select(selectXsrfToken).subscribe((t) => (this.xsrfToken = t));
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = request;

    // Add auth token
    const token = this.token || localStorage.getItem('authToken');
    if (token) {
      authReq = authReq.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    // Add XSRF token for state-changing requests
    if (this.xsrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      authReq = authReq.clone({
        setHeaders: { 'X-XSRF-TOKEN': this.xsrfToken },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/auth/')) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      this.store.dispatch(AuthActions.refreshToken());

      return this.store.select(selectAuthToken).pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(
            request.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            }),
          );
        }),
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) =>
        next.handle(
          request.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          }),
        ),
      ),
    );
  }
}
