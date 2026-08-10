import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

/** Partial update of the AuctionMonitorConfig singleton. */
export class UpdateMonitorConfigDto {
  @IsOptional() @IsBoolean()
  paused?: boolean;

  @IsOptional() @IsInt() @Min(0) @Max(120)
  leadMinutes?: number;

  @IsOptional() @IsInt() @Min(1) @Max(30)
  maxConcurrentSessions?: number;

  @IsOptional() @IsInt() @Min(1) @Max(720)
  idleStopMinutes?: number;

  @IsOptional() @IsInt() @Min(5) @Max(1440)
  maxDurationMinutes?: number;

  @IsOptional() @IsBoolean()
  onlySold?: boolean;

  @IsOptional() @IsString()
  eventNames?: string;

  @IsOptional() @IsString()
  wsUrlPattern?: string;

  @IsOptional() @IsBoolean()
  includeRaw?: boolean;

  /** Empty string clears the mirror. */
  @IsOptional() @ValidateIf((_, v) => v !== null && v !== '') @IsString()
  forwardWebhookUrl?: string | null;
}
