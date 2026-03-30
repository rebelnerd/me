import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent {
  tabs = input<Tab[]>([]);
  activeTab = input<string>('');

  tabChanged = output<string>();

  selectTab(id: string) {
    this.tabChanged.emit(id);
  }
}
