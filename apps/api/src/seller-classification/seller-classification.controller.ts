import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkJwtGuard, CurrentUser } from '@htownautos/auth';
import { SellerClassificationService } from './seller-classification.service';
import { ClassifySellerDto } from './dto/classify-seller.dto';

/**
 * Staff-managed seller trust + Source classification. Setting a seller here
 * updates the Trusted Seller matching filter and the Source facet across the CRM
 * and portal immediately (both read the classification live).
 */
@ApiTags('Auction seller classifications')
@Controller('auctions/seller-classifications')
@UseGuards(ClerkJwtGuard)
@ApiBearerAuth()
export class SellerClassificationController {
  constructor(private readonly service: SellerClassificationService) {}

  @Get()
  @ApiOperation({ summary: 'List every seller in the data with its classification' })
  list(
    @Query('search') search?: string,
    @Query('onlyUnreviewed') onlyUnreviewed?: string,
    @Query('risk') risk?: string,
  ) {
    return this.service.aggregate({
      search,
      onlyUnreviewed: onlyUnreviewed === 'true',
      // `risk=low,medium` — multiseleccion desde la tabla.
      risk: risk ? risk.split(',').map((r) => r.trim()).filter(Boolean) : undefined,
    });
  }

  @Post('preclassify')
  @ApiOperation({
    summary: 'Propose a risk level by name for every seller nobody has reviewed',
    description:
      'Deja las filas en reviewed=false a proposito: es una propuesta del ' +
      'clasificador, no una decision del equipo. Lo ya revisado no se toca.',
  })
  preclassify() {
    return this.service.preclassifyAll();
  }

  @Get('unreviewed-count')
  @ApiOperation({ summary: 'Count of sellers still needing staff review' })
  async count() {
    return { count: await this.service.unreviewedCount() };
  }

  @Post()
  @ApiOperation({ summary: 'Classify a seller (category + risk level)' })
  classify(
    @Body() dto: ClassifySellerDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.setClassification(
      dto.sellerName,
      dto.category,
      dto.riskLevel,
      userId ?? null,
    );
  }

  @Delete(':sellerKey')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a classification (reverts to derived/unreviewed)' })
  async remove(@Param('sellerKey') sellerKey: string) {
    await this.service.remove(sellerKey);
  }
}
