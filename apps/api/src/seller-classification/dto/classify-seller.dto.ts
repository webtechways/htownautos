import { IsBoolean, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { SELLER_CATEGORIES } from '@htownautos/common';

export class ClassifySellerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  sellerName!: string;

  @IsIn(SELLER_CATEGORIES as unknown as string[])
  category!: string;

  @IsBoolean()
  trusted!: boolean;
}
