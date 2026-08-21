import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class BulkActiveDto {
  @ApiProperty({ type: [String] })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(500) @IsString({ each: true })
  ids!: string[];

  @ApiProperty()
  @IsBoolean()
  active!: boolean;
}

/**
 * Al borrar agentes hay que decidir qué pasa con sus subastas futuras:
 * pasárselas a alguien concreto, repartirlas entre los activos, o soltarlas
 * para que las recoja el job de mañana.
 */
export class BulkDeleteDto {
  @ApiProperty({ type: [String] })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(500) @IsString({ each: true })
  ids!: string[];

  @ApiProperty({ enum: ['transfer', 'random', 'release'], default: 'random' })
  @IsIn(['transfer', 'random', 'release'])
  strategy!: 'transfer' | 'random' | 'release';

  /** Obligatorio cuando strategy = transfer. */
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  toAgentId?: string;
}

export class ReassignEntryDto {
  @ApiProperty()
  @IsString()
  toAgentId!: string;
}
