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
  templateUrl: './signup.component.html',
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
