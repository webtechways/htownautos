import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateScraperConfigDto {
  /** Una venta real dura varias horas; menos de una no describe nada. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  saleDurationHours?: number;

  // Por debajo del intervalo de poll de las VMs se darian por muertas estando
  // vivas, y se les quitarian las subastas cada pocos minutos.
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  deadWorkerMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  defaultMaxAuctions?: number;
}
