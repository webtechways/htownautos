import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ExtraExpenseService } from './extra-expense.service';
import { CreateExtraExpenseDto } from './dto/create-extra-expense.dto';
import { UpdateExtraExpenseDto } from './dto/update-extra-expense.dto';
import { QueryExtraExpenseDto } from './dto/query-extra-expense.dto';
import { AnalyzeReceiptsDto, AnalyzeReceiptsResult } from './dto/analyze-receipts.dto';
import { ExtraExpenseEntity } from './entities/extra-expense.entity';
import { PaginatedResponseDto } from '@htownautos/common';
import { AuditLog } from '@htownautos/common';

@ApiTags('Extra Expenses')
@Controller('extra-expenses')
export class ExtraExpenseController {
  constructor(private readonly service: ExtraExpenseService) {}

  @Post()
  @AuditLog({
    action: 'create',
    resource: 'extra-expense',
    level: 'medium',
    pii: false,
    compliance: ['routeone', 'dealertrack', 'glba'],
  })
  @ApiOperation({ summary: 'Create a new extra expense' })
  @ApiBody({
    type: CreateExtraExpenseDto,
    examples: {
      basic: {
        summary: 'New tires expense',
        value: {
          vehicleId: '123e4567-e89b-12d3-a456-426614174000',
          description: 'New tires - Michelin',
          price: 450.0,
        },
      },
      withReceipts: {
        summary: 'Repair with receipts',
        value: {
          vehicleId: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Engine repair',
          price: 1250.5,
          receiptIds: ['123e4567-e89b-12d3-a456-426614174001'],
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: ExtraExpenseEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Vehicle not found' })
  create(@Body() dto: CreateExtraExpenseDto): Promise<ExtraExpenseEntity> {
    return this.service.create(dto);
  }

  @Post('analyze-receipts')
  @AuditLog({
    action: 'read',
    resource: 'extra-expense',
    level: 'low',
    pii: false,
    compliance: ['routeone', 'dealertrack', 'glba'],
  })
  @ApiOperation({ summary: 'Analyze receipt images using AI to extract expense data' })
  @ApiBody({
    type: AnalyzeReceiptsDto,
    examples: {
      basic: {
        summary: 'Analyze receipts',
        value: {
          receiptIds: ['123e4567-e89b-12d3-a456-426614174001'],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Receipt analysis result',
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', example: 'Auto parts from AutoZone' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              item: { type: 'string', example: 'Oil Filter' },
              amount: { type: 'number', example: 12.99 },
            },
          },
        },
        shippingCost: { type: 'number', example: 9.99 },
        tax: { type: 'number', example: 3.50 },
        total: { type: 'number', example: 45.99 },
      },
    },
  })
  analyzeReceipts(@Body() dto: AnalyzeReceiptsDto): Promise<AnalyzeReceiptsResult> {
    return this.service.analyzeReceipts(dto);
  }

  @Get()
  @AuditLog({
    action: 'read',
    resource: 'extra-expense',
    level: 'low',
    pii: false,
    compliance: ['routeone', 'dealertrack', 'glba'],
  })
  @ApiOperation({ summary: 'List extra expenses (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'vehicleId', required: false, type: String, description: 'Filter by vehicle UUID' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResponseDto<ExtraExpenseEntity> })
  findAll(@Query() query: QueryExtraExpenseDto): Promise<PaginatedResponseDto<ExtraExpenseEntity>> {
    return this.service.findAll(query);
  }

  @Get('vehicle/:vehicleId/total')
  @AuditLog({
    action: 'read',
    resource: 'extra-expense',
    level: 'medium',
    pii: false,
    compliance: ['routeone', 'dealertrack', 'glba'],
  })
  @ApiOperation({ summary: 'Get total expenses for a vehicle' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: { type: 'object', properties: { total: { type: 'number', example: 2750.5 } } },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Vehicle not found' })
  getVehicleTotal(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ): Promise<{ total: number }> {
    return this.service.getVehicleTotal(vehicleId);
  }

  @Get(':id')
  @AuditLog({
    action: 'read',
    resource: 'extra-expense',
    level: 'low',
    pii: false,
    compliance: ['routeone', 'dealertrack', 'glba'],
  })
  @ApiOperation({ summary: 'Get an extra expense by ID' })
  @ApiParam({ name: 'id', description: 'Extra expense UUID' })
  @ApiResponse({ status: HttpStatus.OK, type: ExtraExpenseEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Expense not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ExtraExpenseEntity> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @AuditLog({
    action: 'update',
    resource: 'extra-expense',
    level: 'medium',
    pii: false,
    compliance: ['routeone', 'dealertrack', 'glba'],
    trackChanges: true,
  })
  @ApiOperation({ summary: 'Update an extra expense (vehicleId is immutable)' })
  @ApiParam({ name: 'id', description: 'Extra expense UUID' })
  @ApiBody({
    type: UpdateExtraExpenseDto,
    examples: {
      description: {
        summary: 'Update description',
        value: { description: 'New tires - Michelin Pilot Sport 4S' },
      },
      price: {
        summary: 'Update price',
        value: { price: 475.0 },
      },
      receipts: {
        summary: 'Set receipt images',
        value: { receiptIds: ['123e4567-e89b-12d3-a456-426614174001'] },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: ExtraExpenseEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Expense not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExtraExpenseDto,
  ): Promise<ExtraExpenseEntity> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @AuditLog({
    action: 'delete',
    resource: 'extra-expense',
    level: 'high',
    pii: false,
    compliance: ['routeone', 'dealertrack', 'glba'],
    trackChanges: true,
  })
  @ApiOperation({ summary: 'Delete an extra expense' })
  @ApiParam({ name: 'id', description: 'Extra expense UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Expense deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Expense not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.service.remove(id);
  }
}
