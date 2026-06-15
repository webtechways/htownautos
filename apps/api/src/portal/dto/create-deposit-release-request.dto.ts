import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDepositReleaseRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
