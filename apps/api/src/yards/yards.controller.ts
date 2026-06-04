import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClerkJwtGuard } from '@htownautos/auth';
import { YardsService } from './yards.service';
import { CreateYardDto } from './dto/create-yard.dto';
import { UpdateYardDto } from './dto/update-yard.dto';
import { QueryYardsDto } from './dto/query-yards.dto';

@ApiTags('Yards')
@Controller('yards')
@UseGuards(ClerkJwtGuard)
export class YardsController {
  constructor(private readonly service: YardsService) {}

  @Get()
  @ApiOperation({ summary: 'List yards (paginated, filterable)' })
  @ApiResponse({ status: HttpStatus.OK })
  list(@Query() query: QueryYardsDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single yard with usage counts' })
  @ApiParam({ name: 'id' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a yard' })
  create(@Body() dto: CreateYardDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a yard' })
  @ApiParam({ name: 'id' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateYardDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Delete a yard. Listings / inspections lose their yardId (set to NULL) but keep the denormalized yardName/yardNumber strings.',
  })
  @ApiParam({ name: 'id' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
