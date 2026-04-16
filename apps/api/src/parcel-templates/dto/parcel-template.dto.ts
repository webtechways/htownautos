import { IsString, IsNumber, IsOptional, IsBoolean, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParcelTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  carrier?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  shippoTemplateToken?: string;

  @ApiProperty()
  @IsNumber() @Min(0)
  length: number;

  @ApiProperty()
  @IsNumber() @Min(0)
  width: number;

  @ApiProperty()
  @IsNumber() @Min(0)
  height: number;

  @ApiPropertyOptional({ enum: ['in', 'cm'], default: 'in' })
  @IsOptional() @IsIn(['in', 'cm'])
  distanceUnit?: 'in' | 'cm';

  @ApiPropertyOptional()
  @IsOptional() @IsNumber() @Min(0)
  defaultWeight?: number;

  @ApiPropertyOptional({ enum: ['lb', 'kg'], default: 'lb' })
  @IsOptional() @IsIn(['lb', 'kg'])
  massUnit?: 'lb' | 'kg';

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isDefault?: boolean;
}

export class UpdateParcelTemplateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() carrier?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shippoTemplateToken?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) length?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) width?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) height?: number;
  @ApiPropertyOptional() @IsOptional() @IsIn(['in', 'cm']) distanceUnit?: 'in' | 'cm';
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) defaultWeight?: number;
  @ApiPropertyOptional() @IsOptional() @IsIn(['lb', 'kg']) massUnit?: 'lb' | 'kg';
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}
