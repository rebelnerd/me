import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  open = input(false);
  title = input<string>('');
  size = input<'sm' | 'md' | 'lg'>('md');
  closeOnOverlay = input(true);

  closed = output<void>();

  onOverlayClick(event: MouseEvent) {
    if (this.closeOnOverlay() && event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
