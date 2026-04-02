import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface NavItem {
  icon: any;
  label: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'ds-bottom-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  items = input<NavItem[]>([]);
  navigated = output<string>();
}
