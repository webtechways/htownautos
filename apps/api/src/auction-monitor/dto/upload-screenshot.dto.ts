import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * A page capture pushed by the auction-monitor worker. The worker has no S3
 * credentials — it posts the image here with the shared ingest secret and the
 * API stores it.
 */
export class UploadScreenshotDto {
  @ApiProperty({ enum: ['login', 'session'] })
  @IsIn(['login', 'session'])
  kind!: 'login' | 'session';

  @ApiPropertyOptional({ description: 'Required when kind = session' })
  @IsOptional() @IsString()
  sessionId?: string;

  @ApiProperty({ example: 'login-ok', description: 'Short tag shown in the UI' })
  @IsString() @MaxLength(40)
  label!: string;

  @ApiProperty({ description: 'Base64 JPEG (no data: prefix)' })
  @IsString()
  imageBase64!: string;
}
