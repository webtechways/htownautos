import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateRequestItemDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
