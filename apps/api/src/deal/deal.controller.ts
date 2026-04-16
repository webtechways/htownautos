import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DealService } from './deal.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealDto } from './dto/query-deal.dto';
import { CurrentUser } from '@htownautos/auth';

@ApiTags('Deals')
@ApiBearerAuth()
@Controller('deals')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deal' })
  create(
    @Body() createDealDto: CreateDealDto,
    @CurrentUser() user: any,
  ) {
    return this.dealService.create(createDealDto, user.currentTenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List all deals' })
  findAll(
    @Query() query: QueryDealDto,
    @CurrentUser() user: any,
  ) {
    return this.dealService.findAll(query, user.currentTenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.dealService.findOne(id, user.currentTenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deal' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDealDto: Partial<CreateDealDto>,
    @CurrentUser() user: any,
  ) {
    return this.dealService.update(id, updateDealDto, user.currentTenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a deal' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.dealService.remove(id, user.currentTenantId);
  }
}
