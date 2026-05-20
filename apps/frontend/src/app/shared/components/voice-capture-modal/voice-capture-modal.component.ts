import { Component, inject, output, signal, computed, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ModalComponent, ButtonComponent } from '@app/design-system';
import { LucideAngularModule, Mic, Square, X, Check } from 'lucide-angular';
import {
  AudioRecordingService,
  RecordingResult,
} from '../../services/audio-recording.service';
import { TasksActions } from '../../../store/tasks/tasks.actions';
import { selectVoiceCaptureStatus, selectTasksError } from '../../../store/tasks/tasks.selectors';
import { VoiceCaptureStatus } from '@app/interfaces';

@Component({
  selector: 'app-voice-capture-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, LucideAngularModule],
  templateUrl: './voice-capture-modal.component.html',
  styleUrl: './voice-capture-modal.component.scss',
})
export class VoiceCaptureModalComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  audioService = inject(AudioRecordingService);

  closed = output<void>();

  isOpen = signal(true);
  error = signal<string | null>(null);
  isStarting = signal(true); // Track initial auto-start

  voiceCaptureStatus = toSignal(this.store.select(selectVoiceCaptureStatus), {
    initialValue: VoiceCaptureStatus.Idle,
  });

  storeError = toSignal(this.store.select(selectTasksError), {
    initialValue: null as string | null,
  });

  // Combined error from local state or store
  displayError = computed(() => this.error() || this.storeError());

  isProcessing = computed(
    () => this.voiceCaptureStatus() === VoiceCaptureStatus.Processing,
  );

  isSuccess = computed(
    () => this.voiceCaptureStatus() === VoiceCaptureStatus.Success,
  );

  formattedDuration = computed(() => {
    const ms = this.audioService.recordingDuration();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  });

  readonly micIcon = Mic;
  readonly stopIcon = Square;
  readonly closeIcon = X;
  readonly checkIcon = Check;

  readonly VoiceCaptureStatus = VoiceCaptureStatus;
  readonly waveformBars = Array.from({ length: 15 }, (_, i) => i);

  // Expose Math for template
  readonly Math = Math;

  ngOnInit(): void {
    // Clear any previous errors/state
    this.store.dispatch(TasksActions.voiceCaptureReset());
    // Auto-start recording when modal opens
    this.autoStartRecording();
  }

  private async autoStartRecording(): Promise<void> {
    try {
      this.error.set(null);
      await this.audioService.startRecording();
    } catch {
      this.error.set('Could not access microphone. Please grant permission.');
    } finally {
      this.isStarting.set(false);
    }
  }

  async startRecording(): Promise<void> {
    try {
      this.error.set(null);
      await this.audioService.startRecording();
    } catch {
      this.error.set('Could not access microphone. Please grant permission.');
    }
  }

  async stopAndProcess(): Promise<void> {
    try {
      console.log('[VoiceCapture] Stopping recording...');
      const result: RecordingResult = await this.audioService.stopRecording();
      console.log('[VoiceCapture] Recording stopped, duration:', result.durationMs, 'ms, base64 length:', result.audioBase64.length);

      console.log('[VoiceCapture] Dispatching voiceCapture action...');
      this.store.dispatch(
        TasksActions.voiceCapture({
          audioBase64: result.audioBase64,
          mimeType: result.mimeType,
          durationMs: result.durationMs,
        }),
      );
      console.log('[VoiceCapture] Action dispatched');
    } catch (err) {
      console.error('[VoiceCapture] Error:', err);
      this.error.set('Recording failed. Please try again.');
    }
  }

  cancel(): void {
    this.audioService.cancelRecording();
    this.close();
  }

  close(): void {
    this.store.dispatch(TasksActions.voiceCaptureReset());
    this.isOpen.set(false);
    this.closed.emit();
  }

  ngOnDestroy(): void {
    this.audioService.cancelRecording();
  }
}
