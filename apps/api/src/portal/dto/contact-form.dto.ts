import { IsString, IsEmail, IsOptional, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class ContactFormDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tenantSlug?: string;

  @IsOptional()
  @IsUUID()
  buyerId?: string;
}
