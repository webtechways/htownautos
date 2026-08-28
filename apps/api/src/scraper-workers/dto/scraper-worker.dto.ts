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

  // Son pestañas de Chrome abiertas a la vez en una misma máquina. El techo
  // real es la RAM de esa VM, no un número que decida yo: con 49 pestañas de
  // AutoBidMaster hablamos de varios GB. El tope alto existe solo para que un
  // dedazo no pida 5000.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  maxAuctions?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
