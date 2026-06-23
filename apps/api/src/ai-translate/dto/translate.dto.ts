import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class TranslateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  text: string;

  @IsString()
  @IsIn(['en', 'es'])
  targetLang: 'en' | 'es';
}
