import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MeditationScene =
  | 'aurora'      // Northern lights over mountains
  | 'ember'       // Warm sunset / golden hour
  | 'ocean'       // Calm sea at dusk
  | 'twilight'    // Starry night sky
  | 'forest'      // Misty forest
  | 'nebula';     // Milky way / deep space

// Unsplash source URLs - high quality nature photography
// These use Unsplash's image CDN with size/quality parameters
const SCENE_IMAGES: Record<MeditationScene, string> = {
  aurora: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80&auto=format',
  ember: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80&auto=format',
  ocean: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format',
  twilight: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80&auto=format',
  forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80&auto=format',
  nebula: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80&auto=format',
};

@Component({
  selector: 'ds-meditation-bg',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meditation-bg.component.html',
  styleUrl: './meditation-bg.component.scss',
})
export class MeditationBgComponent {
  scene = input<MeditationScene>('aurora');
  intensity = input<'subtle' | 'normal' | 'vivid'>('normal');
  animated = input(true);

  sceneClass = computed(() => `meditation-bg--${this.scene()}`);
  intensityClass = computed(() => `meditation-bg--${this.intensity()}`);
  animatedClass = computed(() => this.animated() ? 'meditation-bg--animated' : '');
  imageUrl = computed(() => SCENE_IMAGES[this.scene()]);
}
