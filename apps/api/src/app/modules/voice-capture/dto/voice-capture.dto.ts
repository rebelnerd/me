import { IsString, IsNumber, MaxLength, Min, Max } from 'class-validator';

export class VoiceCaptureDto {
  @IsString()
  @MaxLength(10_000_000) // ~7.5MB base64 limit
  audioBase64: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  @Min(1000) // Min 1 second
  @Max(300_000) // Max 5 minutes
  durationMs: number;
}
