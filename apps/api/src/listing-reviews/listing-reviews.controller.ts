import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ListingReviewsService } from './listing-reviews.service';
import { CurrentUser, CurrentTenant, ClerkJwtGuard } from '@htownautos/auth';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

class UpsertReviewDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @IsOptional()
  @IsString()
  damageLevel?: string | null;
}

@ApiTags('Listing Reviews')
@Controller('listing-reviews')
@UseGuards(ClerkJwtGuard)
export class ListingReviewsController {
  private readonly logger = new Logger(ListingReviewsController.name);

  constructor(private readonly service: ListingReviewsService) {}

  @Get(':lotNumber')
  @ApiOperation({ summary: 'Get review for a listing' })
  async get(
    @CurrentTenant() tenantId: string,
    @Param('lotNumber') lotNumber: string,
  ) {
    const review = await this.service.getByLotNumber(tenantId, BigInt(lotNumber));
    return { data: review };
  }

  @Put(':lotNumber')
  @ApiOperation({ summary: 'Create or update review for a listing' })
  async upsert(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('lotNumber') lotNumber: string,
    @Body() dto: UpsertReviewDto,
  ) {
    this.logger.log(`[PUT ${lotNumber}] tenantId=${tenantId}, userId=${userId}, dto=${JSON.stringify(dto)}`);
    const review = await this.service.upsert(tenantId, userId, BigInt(lotNumber), dto);
    return { data: review };
  }
}
