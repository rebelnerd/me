import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  isSupported: boolean;
  isListening = signal(false);
  transcript = signal('');

  private recognition: any = null;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    this.isSupported = !!SpeechRecognition;

    if (this.isSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        this.transcript.set(finalTranscript || interimTranscript);
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
      };

      this.recognition.onerror = () => {
        this.isListening.set(false);
      };
    }
  }

  start() {
    if (!this.isSupported || this.isListening()) return;
    this.transcript.set('');
    this.recognition.start();
    this.isListening.set(true);
  }

  stop() {
    if (!this.isSupported || !this.isListening()) return;
    this.recognition.stop();
    this.isListening.set(false);
  }

  toggle() {
    if (this.isListening()) {
      this.stop();
    } else {
      this.start();
    }
  }
}
