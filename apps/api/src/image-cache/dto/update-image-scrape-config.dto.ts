import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

/** Partial update of the singleton ImageScrapeConfig control row. */
export class UpdateImageScrapeConfigDto {
  @IsOptional()
  @IsBoolean()
  paused?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  lotsPerTick?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxAttempts?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  perSequenceDelayMs?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(32)
  concurrency?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(8760)
  proxyResyncHours?: number;
}
