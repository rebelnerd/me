import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, TextInputComponent } from '@app/design-system';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, ButtonComponent, TextInputComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Get started by creating your account.</p>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="auth-name-row">
            <ds-text-input
              label="First Name"
              placeholder="John"
              [ngModel]="firstName()"
              (ngModelChange)="firstName.set($event)"
              name="firstName"
            />
            <ds-text-input
              label="Last Name"
              placeholder="Doe"
              [ngModel]="lastName()"
              (ngModelChange)="lastName.set($event)"
              name="lastName"
            />
          </div>
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
            placeholder="Create a password"
            [ngModel]="password()"
            (ngModelChange)="password.set($event)"
            name="password"
          />
          <ds-button
            type="submit"
            [fullWidth]="true"
            [loading]="loading()"
            [disabled]="!email() || !password() || !firstName() || !lastName()"
          >
            Create Account
          </ds-button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/auth/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');

  private store = inject(Store);
  loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });
  error = toSignal(this.store.select(selectAuthError), { initialValue: null });

  onSubmit() {
    this.store.dispatch(
      AuthActions.signup({
        email: this.email(),
        password: this.password(),
        firstName: this.firstName(),
        lastName: this.lastName(),
      }),
    );
  }
}
