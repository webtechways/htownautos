import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ArrayUnique,
  ValidateNested,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/** One car in the inspection cart. */
export class CartItemDto {
  /** Copart lot number — required to uniquely identify the vehicle at the yard. */
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  lotNumber!: string;

  /** VIN — optional at cart time (may not yet be visible on the lot). */
  @IsOptional()
  @IsString()
  @MinLength(11)
  @MaxLength(17)
  vin?: string;

  /**
   * Yard UUID from our yards table.
   * The client MUST send this — we do NOT fall back to a lookup.
   * Assumption: the frontend already has the yardId from the Copart listing
   * (CopartService.findByLotNumber returns yardId when we have it indexed).
   * See ASSUMPTIONS note in portal.service.ts.
   */
  @IsUUID()
  yardId!: string;

  /** Human-readable yard name (denormalized cache, stored on VehicleInspection). */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  yardName?: string;
}

/** Cart submitted for quote or checkout. */
export class InspectionCartDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ArrayUnique((item: CartItemDto) => item.lotNumber)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[];
}
