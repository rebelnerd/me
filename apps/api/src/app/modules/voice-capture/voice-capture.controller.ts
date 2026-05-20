import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VoiceCaptureService } from './voice-capture.service';
import { VoiceCaptureDto } from './dto/voice-capture.dto';
import { IVoiceCaptureResponse } from '@app/interfaces';

@Controller('voice-capture')
export class VoiceCaptureController {
  private readonly logger = new Logger(VoiceCaptureController.name);

  constructor(private readonly voiceCaptureService: VoiceCaptureService) {}

  @Post()
  @HttpCode(200)
  async captureVoice(
    @CurrentUser('id') userId: number,
    @Body() dto: VoiceCaptureDto,
  ): Promise<IVoiceCaptureResponse> {
    this.logger.log(`Received voice capture request from user ${userId}, duration: ${dto.durationMs}ms, mimeType: ${dto.mimeType}, base64 length: ${dto.audioBase64?.length}`);
    return this.voiceCaptureService.processVoiceCapture(userId, dto);
  }
}
