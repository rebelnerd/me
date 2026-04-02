import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Mic } from 'lucide-angular';

@Component({
  selector: 'ds-voice-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './voice-button.component.html',
  styleUrl: './voice-button.component.scss',
})
export class VoiceButtonComponent {
  recording = input(false);
  disabled = input(false);
  clicked = output<void>();

  protected readonly micIcon = Mic;
}
