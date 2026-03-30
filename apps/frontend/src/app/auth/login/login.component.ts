import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, TextInputComponent } from '@app/design-system';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, ButtonComponent, TextInputComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-title">Sign In</h1>
        <p class="auth-subtitle">Welcome back. Enter your credentials to continue.</p>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <ds-text-input
            label="Email"
            type="email"
            placeholder="you@example.com"
            [ngModel]="email()"
            (ngModelChange)="email.set($event)"
            name="email"
          />
          <ds-text-input
            label="Password"
            type="password"
            placeholder="Enter your password"
            [ngModel]="password()"
            (ngModelChange)="password.set($event)"
            name="password"
          />
          <ds-button
            type="submit"
            [fullWidth]="true"
            [loading]="loading()"
            [disabled]="!email() || !password()"
          >
            Sign In
          </ds-button>
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/auth/signup">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = signal('');
  password = signal('');

  private store = inject(Store);
  loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });
  error = toSignal(this.store.select(selectAuthError), { initialValue: null });

  onSubmit() {
    this.store.dispatch(
      AuthActions.login({
        email: this.email(),
        password: this.password(),
      }),
    );
  }
}
