import { Body, Controller, Delete, Get, Param, Patch, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

interface UserParcelTemplateBody {
  name: string;
  length: number | string;
  width: number | string;
  height: number | string;
  distanceUnit: 'in' | 'cm';
  weight?: number | string;
  weightUnit?: 'lb' | 'kg' | 'oz' | 'g';
}

@ApiTags('Shippo · User Parcel Templates')
@ApiBearerAuth()
@Controller('shippo/user-parcel-templates')
export class ShippoUserParcelTemplatesController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List user parcel templates' })
  list() {
    return this.shippo.listUserParcelTemplates();
  }

  @Post()
  @ApiOperation({ summary: 'Create a user parcel template' })
  create(@Body() body: UserParcelTemplateBody) {
    return this.shippo.createUserParcelTemplate(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.shippo.getUserParcelTemplate(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<UserParcelTemplateBody>) {
    // Shippo SDK requires the full object on update; fetch and merge partials.
    // The fetched body may use snake_case keys when the SDK raw-parses its response,
    // so read both variants.
    const existing = (await this.shippo.getUserParcelTemplate(id)) as any;
    const pick = <T>(camel: string, snake: string): T | undefined =>
      existing[camel] ?? existing[snake];
    const merged: UserParcelTemplateBody = {
      name: body.name ?? existing.name,
      length: body.length ?? pick<string>('length', 'length')!,
      width: body.width ?? pick<string>('width', 'width')!,
      height: body.height ?? pick<string>('height', 'height')!,
      distanceUnit: (body.distanceUnit ?? pick<'in' | 'cm'>('distanceUnit', 'distance_unit'))!,
      weight: body.weight ?? pick<string>('weight', 'weight'),
      weightUnit: (body.weightUnit ?? pick<'lb' | 'kg' | 'oz' | 'g'>('weightUnit', 'weight_unit'))!,
    };
    return this.shippo.updateUserParcelTemplate(id, merged);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.shippo.deleteUserParcelTemplate(id);
  }
}
