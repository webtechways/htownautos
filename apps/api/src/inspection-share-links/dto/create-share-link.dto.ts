import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShareLinkDto {
  /**
   * How many hours from now the link is valid. Omit (or pass null) to
   * make it never expire.
   */
  @ApiPropertyOptional({ minimum: 1, maximum: 24 * 365, example: 168 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24 * 365) // one year
  expiresInHours?: number;
}
