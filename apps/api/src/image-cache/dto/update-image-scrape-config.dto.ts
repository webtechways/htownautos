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

  /** Lots the consumer processes at once (RabbitMQ prefetch). */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(16)
  concurrentLots?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(8760)
  proxyResyncHours?: number;

  /** Delete cached galleries this many days after the sale. 0 = keep forever. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3650)
  retentionDays?: number;
}
