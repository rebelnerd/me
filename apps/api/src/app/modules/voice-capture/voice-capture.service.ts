import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AssemblyAiService } from './assemblyai.service';
import { ClaudeService } from './claude.service';
import { TaskService } from '../task/task.service';
import { VoiceCaptureDto } from './dto/voice-capture.dto';
import { IVoiceCaptureResponse } from '@app/interfaces';

@Injectable()
export class VoiceCaptureService {
  private readonly logger = new Logger(VoiceCaptureService.name);

  constructor(
    private readonly assemblyAi: AssemblyAiService,
    private readonly claude: ClaudeService,
    private readonly taskService: TaskService,
  ) {}

  async processVoiceCapture(
    userId: number,
    dto: VoiceCaptureDto,
  ): Promise<IVoiceCaptureResponse> {
    this.logger.log(`Processing voice capture for user ${userId}, duration: ${dto.durationMs}ms`);

    // 1. Decode audio
    const audioBuffer = Buffer.from(dto.audioBase64, 'base64');
    this.logger.log(`Audio buffer size: ${audioBuffer.length} bytes`);

    // 2. Send to AssemblyAI for transcription
    this.logger.log('Sending to AssemblyAI for transcription...');
    const transcription = await this.assemblyAi.transcribe(
      audioBuffer,
      dto.mimeType,
    );
    this.logger.log(`Transcription result: "${transcription}"`);

    if (!transcription || transcription.trim().length === 0) {
      throw new BadRequestException(
        'Could not transcribe audio. Please try again.',
      );
    }

    // 3. Send transcription to Claude for task formatting
    this.logger.log('Sending to Claude for task formatting...');
    const taskData = await this.claude.formatAsTask(transcription);
    this.logger.log(`Task data: ${JSON.stringify(taskData)}`);

    // 4. Create task in backlog (scheduledDate is null)
    this.logger.log('Creating task...');
    const task = await this.taskService.create(userId, {
      title: taskData.title,
      description: taskData.description,
      notes: taskData.notes,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      tags: taskData.tags,
    });
    this.logger.log(`Task created with id: ${task.id}`);

    return {
      task: { ...task, isBlocked: false }, // New tasks have no prerequisites
      transcription,
    };
  }
}
