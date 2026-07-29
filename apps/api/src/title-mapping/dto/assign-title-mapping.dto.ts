import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ASSIGNABLE_TITLE_CATEGORIES } from '@htownautos/common';

export class AssignTitleMappingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8)
  code!: string;

  @IsIn(ASSIGNABLE_TITLE_CATEGORIES as unknown as string[])
  category!: string;
}
