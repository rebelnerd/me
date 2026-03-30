import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent, BadgeComponent, AvatarComponent } from '@app/design-system';
import { AuthActions } from '../store/auth/auth.actions';
import { selectCurrentUser } from '../store/auth/auth.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonComponent, BadgeComponent, AvatarComponent],
  template: `
    <div class="home">
      <header class="home__header">
        <div class="home__header-left">
          <h1 class="home__title">Dashboard</h1>
          <ds-badge variant="success">Active</ds-badge>
        </div>
        <div class="home__header-right">
          @if (user(); as u) {
            <ds-avatar [name]="u.firstName + ' ' + u.lastName" size="md" />
            <span class="home__user-name">{{ u.firstName }}</span>
          }
          <ds-button variant="ghost" size="sm" (clicked)="logout()">Logout</ds-button>
        </div>
      </header>

      <main class="home__content">
        <div class="home__card">
          <h2>Welcome to your app</h2>
          <p>This is your authenticated home page. Start building from here.</p>
        </div>
      </main>
    </div>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private store = inject(Store);
  user = toSignal(this.store.select(selectCurrentUser));

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
