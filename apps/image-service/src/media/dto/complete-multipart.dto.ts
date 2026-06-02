import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { InitMultipartDto } from './init-multipart.dto';

export class MultipartPartDto {
  @ApiProperty({ description: 'Part number (1-indexed)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(10000)
  partNumber: number;

  @ApiProperty({
    description: 'ETag returned by S3 for this part (verbatim, with quotes if present)',
    example: '"d41d8cd98f00b204e9800998ecf8427e"',
  })
  @IsString()
  @IsNotEmpty()
  etag: string;
}

/**
 * Complete body for a multipart upload. Carries the same metadata that was
 * passed to `init` so the `Media` row gets the full FK + label payload.
 * We re-validate here because nothing is persisted server-side between
 * init and complete.
 */
export class CompleteMultipartDto extends InitMultipartDto {
  @ApiProperty({ description: 'Upload session id returned by init' })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ description: 'S3 key returned by init', example: 'uploads/2026/uuid/original.mp4' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'Uploaded parts, with partNumber and the ETag S3 returned',
    type: [MultipartPartDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10000)
  @ValidateNested({ each: true })
  @Type(() => MultipartPartDto)
  parts: MultipartPartDto[];
}
