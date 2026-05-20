import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IVoiceCaptureRequest, IVoiceCaptureResponse } from '@app/interfaces';

@Injectable({ providedIn: 'root' })
export class VoiceCaptureApiService {
  private http = inject(HttpClient);

  capture(request: IVoiceCaptureRequest): Observable<IVoiceCaptureResponse> {
    return this.http.post<IVoiceCaptureResponse>('/api/voice-capture', request);
  }
}
