import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AbortMultipartDto {
  @ApiProperty({ description: 'Upload session id returned by init' })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ description: 'S3 key returned by init' })
  @IsString()
  @IsNotEmpty()
  key: string;
}
