import { PartialType } from '@nestjs/swagger';
import { CreateBuyerVehiclePreferenceDto } from './create-buyer-vehicle-preference.dto';

export class UpdateBuyerVehiclePreferenceDto extends PartialType(
  CreateBuyerVehiclePreferenceDto,
) {}
