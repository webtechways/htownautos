import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const AUCTIONS = ['copart', 'iaai', 'autobidmaster'] as const;
/**
 * Se acepta cualquier código ISO 3166-1 alpha-2. La lista completa con nombres
 * vive en el frontend (`src/lib/countries.ts`), que los resuelve con
 * Intl.DisplayNames; aquí solo se valida la forma para no mantener 249 entradas
 * duplicadas en dos repositorios.
 */
const ISO_COUNTRY = /^[A-Z]{2}$/;

export class CreateScraperAgentDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(60)
  firstName!: string;

  @ApiProperty() @IsString() @MinLength(1) @MaxLength(60)
  lastName!: string;

  /** Se rellena tras registrar la cuenta; vacío equivale a null. */
  @ApiPropertyOptional()
  @IsOptional() @ValidateIf((_, v) => v !== null && v !== '') @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ enum: AUCTIONS, default: 'copart' })
  @IsOptional() @IsIn(AUCTIONS as unknown as string[])
  auction?: string;

  @ApiPropertyOptional({ example: 'US', description: 'Código ISO 3166-1 alpha-2' })
  @IsOptional() @Matches(ISO_COUNTRY, { message: 'country debe ser un código ISO de 2 letras' })
  country?: string;

  /** Si no se envía, el servidor genera una que cumple los criterios del portal. */
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(8) @MaxLength(25)
  password?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  notes?: string | null;
}

export class UpdateScraperAgentDto extends CreateScraperAgentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(60)
  declare firstName: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(60)
  declare lastName: string;
}

export class GenerateScraperAgentsDto {
  @ApiProperty({ default: 20, minimum: 1, maximum: 100 })
  @IsInt() @Min(1) @Max(100)
  count!: number;

  @ApiPropertyOptional({ enum: AUCTIONS, default: 'copart' })
  @IsOptional() @IsIn(AUCTIONS as unknown as string[])
  auction?: string;

  @ApiPropertyOptional({ example: 'US', description: 'Código ISO 3166-1 alpha-2' })
  @IsOptional() @Matches(ISO_COUNTRY, { message: 'country debe ser un código ISO de 2 letras' })
  country?: string;
}
