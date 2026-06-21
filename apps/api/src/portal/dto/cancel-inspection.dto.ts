import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelInspectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
