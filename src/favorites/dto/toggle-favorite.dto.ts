import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum FavoriteType {
  COPART = 'copart',
}

export class ToggleFavoriteDto {
  @IsNotEmpty()
  @IsString()
  listingId: string;

  @IsNotEmpty()
  @IsEnum(FavoriteType)
  type: FavoriteType;
}
