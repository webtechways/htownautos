import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { BuyerAuctionBidsService } from './buyer-auction-bids.service';
import { CreateBuyerAuctionBidsDto } from './dto/create-buyer-auction-bid.dto';
import { UpdateBuyerAuctionBidDto } from './dto/update-buyer-auction-bid.dto';
import {
  CurrentTenant,
  CurrentUser,
  ClerkJwtGuard,
} from '@htownautos/auth';

@ApiTags('Buyer Auction Bids')
@Controller('buyers/:buyerId/auction-bids')
@UseGuards(ClerkJwtGuard)
export class BuyerAuctionBidsController {
  constructor(private readonly service: BuyerAuctionBidsService) {}

  @Get()
  @ApiOperation({ summary: "List a buyer's auction bids (cars for bids)" })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiResponse({ status: HttpStatus.OK })
  list(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ) {
    return this.service.list(buyerId, tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign one or multiple auction cars to a buyer with max bid',
  })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Body() dto: CreateBuyerAuctionBidsDto,
  ) {
    return this.service.createMany(buyerId, tenantId, userId, dto.items);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a buyer auction bid' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'id', description: 'Bid UUID' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBuyerAuctionBidDto,
  ) {
    return this.service.update(id, buyerId, tenantId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an auction car from a buyer' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'id', description: 'Bid UUID' })
  remove(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(id, buyerId, tenantId);
  }
}
