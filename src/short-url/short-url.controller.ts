import { Controller, Get, Param, Res } from '@nestjs/common';
import * as express from 'express';
import { ShortUrlService } from './short-url.service';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';

@Controller('r')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Get(':code')
  @Public()
  @SkipThrottle()
  async redirect(@Param('code') code: string, @Res() res: express.Response) {
    const url = await this.shortUrlService.resolve(code);
    return res.redirect(302, url);
  }
}
