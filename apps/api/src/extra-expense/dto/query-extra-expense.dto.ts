import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '@htownautos/common';

export class QueryExtraExpenseDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by vehicle UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;
}
