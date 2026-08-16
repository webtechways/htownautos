import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class PostmarkWebhookGuard implements CanActivate {
    private readonly logger;
    canActivate(context: ExecutionContext): boolean;
    private constantTimeEqual;
}
