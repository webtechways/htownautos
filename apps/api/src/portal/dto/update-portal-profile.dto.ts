import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

/**
 * Fields a portal customer may update on their own profile.
 * Sensitive financial/identity fields are deliberately excluded.
 */
export class UpdatePortalProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phoneMain must be a valid phone number' })
  phoneMain?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phoneMobile must be a valid phone number' })
  phoneMobile?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phoneSecondary must be a valid phone number' })
  phoneSecondary?: string;
}
