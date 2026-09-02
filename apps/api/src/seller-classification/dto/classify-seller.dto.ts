import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { SELLER_CATEGORIES, SELLER_RISKS } from '@htownautos/common';

export class ClassifySellerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  sellerName!: string;

  @IsIn(SELLER_CATEGORIES as unknown as string[])
  category!: string;

  /**
   * Sustituye al booleano `trusted`. Ese solo sabia decir "de fiar o no", que
   * metia a una aseguradora y a un desguace en el mismo saco.
   */
  @IsIn(SELLER_RISKS as unknown as string[])
  riskLevel!: string;
}
