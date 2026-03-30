import { Component, input } from '@angular/core';

@Component({
  selector: 'ds-skeleton',
  standalone: true,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  width = input<string>('100%');
  height = input<string>('20px');
  rounded = input(false);
}
