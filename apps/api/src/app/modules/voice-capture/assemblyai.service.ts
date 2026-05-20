import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import { environment } from '../../../envs/environment';

@Injectable()
export class AssemblyAiService {
  private readonly logger = new Logger(AssemblyAiService.name);
  private readonly apiKey = environment.assemblyAi?.apiKey;
  private readonly baseUrl = 'https://api.assemblyai.com/v2';

  async transcribe(audioBuffer: Buffer, mimeType: string): Promise<string> {
    this.logger.log(`Starting transcription, buffer size: ${audioBuffer.length}, mimeType: ${mimeType}`);

    if (!this.apiKey) {
      this.logger.error('AssemblyAI API key not configured');
      throw new InternalServerErrorException(
        'AssemblyAI API key not configured',
      );
    }

    try {
      // 1. Upload audio
      this.logger.log('Uploading audio to AssemblyAI...');
      const uploadRes = await axios.post(`${this.baseUrl}/upload`, audioBuffer, {
        headers: {
          authorization: this.apiKey,
          'content-type': mimeType,
        },
      });

      const audioUrl = uploadRes.data.upload_url;
      this.logger.log(`Audio uploaded, URL: ${audioUrl}`);

      // 2. Request transcription
      this.logger.log('Requesting transcription...');
      const transcriptRes = await axios.post(
        `${this.baseUrl}/transcript`,
        {
          audio_url: audioUrl,
          speech_models: ['universal-3-pro'],
        },
        { headers: { authorization: this.apiKey } },
      );

      const transcriptId = transcriptRes.data.id;
      this.logger.log(`Transcription requested, ID: ${transcriptId}`);

      // 3. Poll for completion (with timeout)
      const maxWait = 60_000; // 60 seconds
      const pollInterval = 2_000; // 2 seconds
      let elapsed = 0;

      while (elapsed < maxWait) {
        const pollRes = await axios.get(
          `${this.baseUrl}/transcript/${transcriptId}`,
          { headers: { authorization: this.apiKey } },
        );

        this.logger.log(`Poll status: ${pollRes.data.status}`);

        if (pollRes.data.status === 'completed') {
          this.logger.log(`Transcription completed: "${pollRes.data.text}"`);
          return pollRes.data.text || '';
        }

        if (pollRes.data.status === 'error') {
          this.logger.error(`Transcription error: ${pollRes.data.error}`);
          throw new Error(pollRes.data.error || 'Transcription failed');
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        elapsed += pollInterval;
      }

      throw new Error('Transcription timeout');
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: unknown } };
      this.logger.error(`Transcription failed: ${err.message}`, err.response?.data || err.stack);
      throw new InternalServerErrorException(
        `Transcription failed: ${err.message}`,
      );
    }
  }
}
