import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateScraperWorkerDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  /** Cadena vacía para desvincular la cuenta. */
  @IsOptional()
  @IsString()
  scraperAgentId?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  // Son pestañas de Chrome abiertas a la vez en una misma máquina: pasar de
  // ~20 es pedirle a la VM que se quede sin memoria a media mañana.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  maxAuctions?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
