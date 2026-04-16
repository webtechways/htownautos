import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Carrier Accounts')
@ApiBearerAuth()
@Controller('shippo/carrier-accounts')
export class ShippoCarrierAccountsController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List carrier accounts' })
  list(
    @Query('carrier') carrier?: string,
    @Query('page') page?: string,
    @Query('results') results?: string,
  ) {
    return this.shippo.listCarrierAccounts({
      carrier,
      page: page ? parseInt(page) : undefined,
      results: results ? parseInt(results) : undefined,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Connect an existing carrier account' })
  create(@Body() body: Record<string, unknown>) {
    return this.shippo.createCarrierAccount(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Add a Shippo-managed carrier account' })
  register(@Body() body: Record<string, unknown>) {
    return this.shippo.registerCarrierAccount(body);
  }

  @Get('registration-status/:carrier')
  @ApiOperation({ summary: 'Carrier registration status' })
  registrationStatus(@Param('carrier') carrier: string) {
    return this.shippo.getRegistrationStatus(carrier);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a carrier account' })
  get(@Param('id') id: string) {
    return this.shippo.getCarrierAccount(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a carrier account' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.shippo.updateCarrierAccount(id, body);
  }

  @Post(':id/oauth2-signin')
  @ApiOperation({ summary: 'Start an OAuth2 sign-in flow for a carrier account' })
  oauth2(
    @Param('id') id: string,
    @Body() body: { redirectUri: string; state?: string },
  ) {
    return this.shippo.initiateOauth2Signin(id, body.redirectUri, body.state);
  }
}
