import { Injectable, signal } from '@angular/core';

export interface RecordingResult {
  audioBase64: string;
  mimeType: string;
  durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class AudioRecordingService {
  isRecording = signal(false);
  recordingDuration = signal(0);
  audioLevel = signal(0); // 0-1 representing current audio level

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime = 0;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrame: number | null = null;

  isSupported(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  async startRecording(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Audio recording not supported');
    }

    // Clean up any previous recording state
    if (this.mediaRecorder) {
      this.cancelRecording();
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Prefer webm/opus for better compression
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });
    this.audioChunks = [];
    this.startTime = Date.now();
    this.recordingDuration.set(0);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // Collect data every 100ms
    this.isRecording.set(true);

    // Set up audio analysis for visualization
    this.setupAudioAnalysis(stream);

    // Update duration every 100ms
    this.durationInterval = setInterval(() => {
      this.recordingDuration.set(Date.now() - this.startTime);
    }, 100);
  }

  private setupAudioAnalysis(stream: MediaStream): void {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!this.analyser || !this.isRecording()) {
        this.audioLevel.set(0);
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);

      // Calculate average level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      this.audioLevel.set(average / 255); // Normalize to 0-1

      this.animationFrame = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  private cleanupAudioAnalysis(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.audioLevel.set(0);
  }

  async stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('No recording in progress'));
        return;
      }

      // Store reference before it gets nulled
      const recorder = this.mediaRecorder;
      const mimeType = recorder.mimeType || 'audio/webm';

      recorder.onstop = async () => {
        if (this.durationInterval) {
          clearInterval(this.durationInterval);
          this.durationInterval = null;
        }

        const durationMs = Date.now() - this.startTime;

        console.log('[AudioRecording] Chunks collected:', this.audioChunks.length);

        if (this.audioChunks.length === 0) {
          reject(new Error('No audio data captured'));
          return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        console.log('[AudioRecording] Blob size:', audioBlob.size);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          // Clear chunks after successful conversion
          this.audioChunks = [];
          resolve({
            audioBase64: base64,
            mimeType,
            durationMs,
          });
        };
        reader.onerror = () => reject(new Error('Failed to encode audio'));
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        recorder.stream.getTracks().forEach((track) => track.stop());
        this.mediaRecorder = null;
        this.isRecording.set(false);
        this.cleanupAudioAnalysis();
      };

      // Request any remaining data before stopping
      if (recorder.state === 'recording') {
        recorder.requestData();
      }
      recorder.stop();
    });
  }

  cancelRecording(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }

    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      this.mediaRecorder = null;
    }

    this.cleanupAudioAnalysis();
    this.audioChunks = [];
    this.isRecording.set(false);
    this.recordingDuration.set(0);
  }
}
