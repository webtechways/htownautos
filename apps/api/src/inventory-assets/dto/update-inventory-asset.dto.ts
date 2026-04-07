import { PartialType } from '@nestjs/swagger';
import { CreateInventoryAssetDto } from './create-inventory-asset.dto';

export class UpdateInventoryAssetDto extends PartialType(CreateInventoryAssetDto) {}
