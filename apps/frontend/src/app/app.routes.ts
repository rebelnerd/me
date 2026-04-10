import { Route } from '@angular/router';
import { authGuard, guestGuard } from './shared/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./auth/signup/signup.component').then((m) => m.SignupComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./focus/focus.component').then((m) => m.FocusComponent),
      },
      {
        path: 'capture',
        loadComponent: () =>
          import('./capture/capture.component').then((m) => m.CaptureComponent),
      },
      {
        path: 'plan',
        loadComponent: () =>
          import('./plan/plan.component').then((m) => m.PlanComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
