import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DecisionNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
