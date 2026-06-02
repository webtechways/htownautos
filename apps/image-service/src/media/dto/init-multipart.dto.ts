import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Max, Min } from 'class-validator';
import { CreateMediaDto } from './create-media.dto';

/**
 * Init body for a multipart upload. Extends the same metadata shape used by
 * presign/confirm so the eventual `Media` row keeps the same fields — only
 * the transport changes.
 */
export class InitMultipartDto extends CreateMediaDto {
  @ApiProperty({ description: 'Original filename', example: 'inspection.mp4' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'MIME type of the file', example: 'video/mp4' })
  @IsString()
  @Matches(
    /^(image\/(jpeg|png|webp|gif)|application\/pdf|video\/(mp4|quicktime|webm)|audio\/(mp4|mpeg|webm|ogg|wav|x-m4a))$/,
    {
      message:
        'Allowed: image/*, application/pdf, video/*, audio/* (for inspection voice notes)',
    },
  )
  contentType: string;

  @ApiProperty({ description: 'Total file size in bytes', example: 52428800 })
  @IsInt()
  @Min(1)
  // 5 GB hard cap — keeps a runaway client from spawning 10k presign URLs.
  @Max(5 * 1024 * 1024 * 1024)
  fileSize: number;
}
