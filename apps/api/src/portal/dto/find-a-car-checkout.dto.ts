import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { WantedVehicleDto } from './wanted-vehicle.dto';

export class FindACarCheckoutDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WantedVehicleDto)
  preferences!: WantedVehicleDto[];

  @IsBoolean()
  acceptedTerms!: boolean;
}
