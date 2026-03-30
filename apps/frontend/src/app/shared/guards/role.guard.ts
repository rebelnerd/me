import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectUserRole } from '../../store/auth/auth.selectors';
import { UserRole } from '@app/interfaces';

export function roleGuard(...roles: UserRole[]): CanActivateFn {
  return () => {
    const store = inject(Store);
    const router = inject(Router);

    return store.select(selectUserRole).pipe(
      take(1),
      map((userRole) => {
        if (userRole && roles.includes(userRole)) {
          return true;
        }
        return router.createUrlTree(['/']);
      }),
    );
  };
}
