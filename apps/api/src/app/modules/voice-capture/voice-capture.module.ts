import { Module } from '@nestjs/common';
import { VoiceCaptureController } from './voice-capture.controller';
import { VoiceCaptureService } from './voice-capture.service';
import { AssemblyAiService } from './assemblyai.service';
import { ClaudeService } from './claude.service';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [TaskModule],
  controllers: [VoiceCaptureController],
  providers: [VoiceCaptureService, AssemblyAiService, ClaudeService],
})
export class VoiceCaptureModule {}
