import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const AUCTIONS = ['copart', 'iaai', 'autobidmaster'] as const;
/** Países donde operan los portales. Se guarda el código ISO de 2 letras. */
export const COUNTRIES = ['US', 'CA', 'MX', 'ES', 'DE', 'GB', 'AE', 'BR'] as const;

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

  @ApiPropertyOptional({ enum: COUNTRIES, default: 'US' })
  @IsOptional() @IsIn(COUNTRIES as unknown as string[])
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

  @ApiPropertyOptional({ enum: COUNTRIES, default: 'US' })
  @IsOptional() @IsIn(COUNTRIES as unknown as string[])
  country?: string;
}
