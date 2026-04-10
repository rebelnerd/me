import { Component, inject, signal, computed, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AvatarComponent } from '@app/design-system';
import { LucideAngularModule, User, LogOut, Settings } from 'lucide-angular';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { AuthActions } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [AvatarComponent, LucideAngularModule],
  templateUrl: './account-menu.component.html',
  styleUrl: './account-menu.component.scss',
})
export class AccountMenuComponent {
  private store = inject(Store);
  private router = inject(Router);
  private elRef = inject(ElementRef);

  user = toSignal(this.store.select(selectCurrentUser));
  open = signal(false);

  userIcon = User;
  settingsIcon = Settings;
  logoutIcon = LogOut;

  userName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  userEmail = computed(() => this.user()?.email ?? '');

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.open() && !this.elRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  toggle() {
    this.open.update((v) => !v);
  }

  goToProfile() {
    this.open.set(false);
    this.router.navigate(['/profile']);
  }

  logout() {
    this.open.set(false);
    this.store.dispatch(AuthActions.logout());
  }
}
