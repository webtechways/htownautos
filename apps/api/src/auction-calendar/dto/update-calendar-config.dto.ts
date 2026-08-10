import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Partial update of the AuctionCalendarConfig singleton. */
export class UpdateCalendarConfigDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(168)
  refreshHours?: number;
}
