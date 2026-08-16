import * as express from 'express';
import { ShortUrlService } from './short-url.service';
export declare class ShortUrlController {
    private readonly shortUrlService;
    constructor(shortUrlService: ShortUrlService);
    redirect(code: string, res: express.Response): Promise<void>;
}
