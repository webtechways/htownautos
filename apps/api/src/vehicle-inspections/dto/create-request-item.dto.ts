import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRequestItemDto {
  @IsString()
  @MinLength(1)
  note!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
