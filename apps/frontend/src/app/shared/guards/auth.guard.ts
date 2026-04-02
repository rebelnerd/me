import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { selectAuthInitialized, selectIsAuthenticated } from '../../store/auth/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return combineLatest([
    store.select(selectAuthInitialized),
    store.select(selectIsAuthenticated),
  ]).pipe(
    filter(([initialized]) => initialized),
    take(1),
    map(([, isAuthenticated]) => {
      if (!isAuthenticated) {
        return router.createUrlTree(['/auth/login']);
      }
      return true;
    }),
  );
};

export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return combineLatest([
    store.select(selectAuthInitialized),
    store.select(selectIsAuthenticated),
  ]).pipe(
    filter(([initialized]) => initialized),
    take(1),
    map(([, isAuthenticated]) => {
      if (isAuthenticated) {
        return router.createUrlTree(['/']);
      }
      return true;
    }),
  );
};
