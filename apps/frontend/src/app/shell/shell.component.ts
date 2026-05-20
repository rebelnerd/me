import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { BottomNavComponent, NavItem, MeditationBgComponent, MeditationScene } from '@app/design-system';
import { LucideAngularModule, Target, PlusCircle, Calendar, Mic } from 'lucide-angular';
import { AccountMenuComponent } from './account-menu/account-menu.component';
import { VoiceCaptureModalComponent } from '../shared/components/voice-capture-modal/voice-capture-modal.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    BottomNavComponent,
    MeditationBgComponent,
    AccountMenuComponent,
    LucideAngularModule,
    VoiceCaptureModalComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  host: { class: 'theme-dark' },
})
export class ShellComponent {
  private router = inject(Router);

  showVoiceCapture = signal(false);
  readonly micIcon = Mic;

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  navItems = computed<NavItem[]>(() => {
    const url = this.currentUrl();
    return [
      { icon: Target, label: 'Focus', route: '/', active: url === '/' },
      { icon: PlusCircle, label: 'Capture', route: '/capture', active: url === '/capture' },
      { icon: Calendar, label: 'Plan', route: '/plan', active: url === '/plan' },
    ];
  });

  scene = computed<MeditationScene>(() => {
    const url = this.currentUrl();
    if (url === '/capture') return 'ember';
    if (url === '/plan') return 'twilight';
    return 'aurora';
  });

  onNavigate(route: string) {
    this.router.navigate([route]);
  }

  openVoiceCapture() {
    this.showVoiceCapture.set(true);
  }

  closeVoiceCapture() {
    this.showVoiceCapture.set(false);
  }
}
