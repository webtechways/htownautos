import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  IsEnum,
  IsUUID,
} from 'class-validator';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  // Voice notes attached to inspection checklist items.
  AUDIO = 'audio',
}

export enum MediaCategory {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  ENGINE = 'engine',
  DOCUMENT = 'document',
  RECEIPT = 'receipt',
  TITLE = 'title',
  OTHER = 'other',
  // Inspection-specific categories.
  INSPECTION_REQUEST = 'inspection_request', // images attached to specificRequest
  INSPECTION_ITEM = 'inspection_item',       // per-checklist-item photos/videos
  INSPECTION_VOICE = 'inspection_voice',     // voice note (audio)
  // Inspection-level "full walkaround" videos shown above the checklist.
  INSPECTION_FULL_EXTERIOR_VIDEO = 'inspection_full_exterior_video',
  INSPECTION_FULL_INTERIOR_VIDEO = 'inspection_full_interior_video',
  INSPECTION_FULL_ENGINE_VIDEO = 'inspection_full_engine_video',
}

export class CreateMediaDto {
  @ApiPropertyOptional({
    description: 'Title of the media',
    example: 'Front view of vehicle',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the media',
    example: 'Clear front view showing the grille and headlights',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Alt text for images',
    example: '2020 Honda Accord front view',
  })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiProperty({
    description: 'Media type',
    enum: MediaType,
    example: MediaType.IMAGE,
  })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiPropertyOptional({
    description: 'Media category',
    enum: MediaCategory,
    example: MediaCategory.EXTERIOR,
  })
  @IsOptional()
  @IsEnum(MediaCategory)
  category?: MediaCategory;

  @ApiPropertyOptional({
    description: 'Vehicle UUID to associate with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional({
    description: 'Buyer UUID to associate with (PRIVATE - automatically sets isPublic to false)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  buyerId?: string;

  @ApiPropertyOptional({
    description: 'Part UUID to associate with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  partId?: string;

  @ApiPropertyOptional({ description: 'Vehicle inspection UUID (top-level inspection media)' })
  @IsOptional()
  @IsUUID()
  inspectionId?: string;

  @ApiPropertyOptional({ description: 'Inspection checklist item UUID' })
  @IsOptional()
  @IsUUID()
  inspectionChecklistItemId?: string;

  @ApiPropertyOptional({ description: 'Inspection request item UUID' })
  @IsOptional()
  @IsUUID()
  inspectionRequestItemId?: string;

  @ApiPropertyOptional({ description: 'Inspection error code UUID' })
  @IsOptional()
  @IsUUID()
  inspectionErrorCodeId?: string;

  @ApiPropertyOptional({ description: 'Carfax report UUID' })
  @IsOptional()
  @IsUUID()
  carfaxReportId?: string;

  @ApiPropertyOptional({
    description: 'Whether the media is public (ignored if buyerId is provided - buyer media is always private)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
