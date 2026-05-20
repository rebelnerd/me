import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { environment } from '../../../envs/environment';
import { ICreateTaskRequest, TaskPriority } from '@app/interfaces';

interface ClaudeTaskResponse {
  title: string;
  description?: string;
  notes?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

@Injectable()
export class ClaudeService {
  private readonly apiKey = environment.claude?.apiKey;
  private readonly baseUrl = 'https://api.anthropic.com/v1';

  async formatAsTask(transcription: string): Promise<ICreateTaskRequest> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('Claude API key not configured');
    }

    const prompt = `You are a task extraction assistant. Given a voice memo transcription, extract a structured task.

Return a JSON object with these fields:
- title (required): A clear, concise task title (max 100 chars)
- description (optional): Additional context if the memo contains it
- notes (optional): Any extra details mentioned
- priority (optional): "none", "low", "medium", or "high" - only set if urgency is mentioned
- dueDate (optional): ISO date string (YYYY-MM-DD) if a specific date is mentioned
- tags (optional): Array of relevant category tags (max 3)

Transcription: "${transcription}"

Respond with ONLY valid JSON, no markdown or explanation.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        },
      );

      const content = response.data.content[0]?.text || '';
      const parsed: ClaudeTaskResponse = JSON.parse(content);

      return {
        title: parsed.title || transcription.substring(0, 100),
        description: parsed.description,
        notes: parsed.notes,
        priority: parsed.priority,
        dueDate: parsed.dueDate,
        tags: parsed.tags,
      };
    } catch (error) {
      // Fallback: use transcription as title
      return {
        title: transcription.substring(0, 100).trim(),
      };
    }
  }
}
