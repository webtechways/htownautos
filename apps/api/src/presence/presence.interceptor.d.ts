import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PresenceService } from './presence.service';
export declare class PresenceInterceptor implements NestInterceptor {
    private readonly presenceService;
    constructor(presenceService: PresenceService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
