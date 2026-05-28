import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ChecklistCategory } from '@prisma/client';

export class CreateChecklistItemDto {
  @IsEnum(ChecklistCategory)
  category!: ChecklistCategory;

  @IsString()
  @MinLength(1)
  part!: string;

  /**
   * 1 = RED (problem), 2 = YELLOW (review), 3 = GREEN (ok).
   * Leave undefined / null until the inspector has evaluated it.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  quality?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  voiceNoteTranscription?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
