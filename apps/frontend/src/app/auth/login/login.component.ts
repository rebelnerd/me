import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, TextInputComponent, CheckboxComponent } from '@app/design-system';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, ButtonComponent, TextInputComponent, CheckboxComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  rememberMe = signal(false);

  private store = inject(Store);
  loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });
  error = toSignal(this.store.select(selectAuthError), { initialValue: null });

  onSubmit() {
    this.store.dispatch(
      AuthActions.login({
        email: this.email(),
        password: this.password(),
        rememberMe: this.rememberMe(),
      }),
    );
  }
}
