import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { BottomNavComponent, NavItem, MeditationBgComponent, MeditationScene } from '@app/design-system';
import { Target, PlusCircle, Calendar } from 'lucide-angular';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, MeditationBgComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  host: { class: 'theme-dark' },
})
export class ShellComponent {
  private router = inject(Router);

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
}
