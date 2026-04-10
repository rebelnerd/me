import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AvatarComponent, ButtonComponent } from '@app/design-system';
import { LucideAngularModule, ArrowLeft, Mail, Shield } from 'lucide-angular';
import { selectCurrentUser } from '../store/auth/auth.selectors';
import { AuthActions } from '../store/auth/auth.actions';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AvatarComponent, ButtonComponent, LucideAngularModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private store = inject(Store);
  private router = inject(Router);

  user = toSignal(this.store.select(selectCurrentUser));

  arrowLeftIcon = ArrowLeft;
  mailIcon = Mail;
  shieldIcon = Shield;

  userName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  memberSince = computed(() => {
    const u = this.user();
    if (!u?.createdAt) return '';
    return new Date(u.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  });

  goBack() {
    this.router.navigate(['/']);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
