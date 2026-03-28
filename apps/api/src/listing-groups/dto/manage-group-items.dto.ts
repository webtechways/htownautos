import { IsArray, ArrayMinSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemsToGroupDto {
  @ApiProperty({ description: 'Lot numbers to add', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  lotNumbers: string[];
}
