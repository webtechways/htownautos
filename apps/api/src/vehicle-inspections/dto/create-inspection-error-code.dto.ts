import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { InspectionErrorLevel } from '@prisma/client';

export class CreateInspectionErrorCodeDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  /** Severity level — GREEN | YELLOW | RED. Defaults to GREEN (set by Prisma schema). */
  @IsOptional()
  @IsEnum(InspectionErrorLevel)
  level?: InspectionErrorLevel;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  voiceNoteTranscription?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
