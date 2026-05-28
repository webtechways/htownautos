import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ChecklistCategory } from '@prisma/client';

export class UpdateChecklistItemDto {
  @IsOptional() @IsEnum(ChecklistCategory)
  category?: ChecklistCategory;

  @IsOptional() @IsString()
  part?: string;

  /** 1=RED, 2=YELLOW, 3=GREEN. */
  @IsOptional() @IsInt() @Min(1) @Max(3)
  quality?: number;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsString()
  voiceNoteTranscription?: string;

  @IsOptional() @IsInt()
  sortOrder?: number;
}
