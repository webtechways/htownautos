import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { CANONICAL_FIELDS } from '@htownautos/common';

export class SetAliasDto {
  @IsIn(CANONICAL_FIELDS as unknown as string[])
  field!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  aliasKey!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  canonical!: string;
}
