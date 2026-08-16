"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PostmarkWebhookGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostmarkWebhookGuard = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
let PostmarkWebhookGuard = PostmarkWebhookGuard_1 = class PostmarkWebhookGuard {
    logger = new common_1.Logger(PostmarkWebhookGuard_1.name);
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const expectedUser = process.env.POSTMARK_WEBHOOK_USER;
        const expectedPass = process.env.POSTMARK_WEBHOOK_PASSWORD;
        if (!expectedUser || !expectedPass) {
            this.logger.error('POSTMARK_WEBHOOK_USER or POSTMARK_WEBHOOK_PASSWORD not configured');
            throw new common_1.UnauthorizedException('Webhook auth not configured');
        }
        const queryToken = request.query?.token;
        if (typeof queryToken === 'string' && queryToken.length > 0) {
            if (this.constantTimeEqual(queryToken, expectedPass)) {
                return true;
            }
            throw new common_1.UnauthorizedException('Invalid webhook token');
        }
        const header = request.headers?.authorization;
        if (header && header.toLowerCase().startsWith('basic ')) {
            const b64 = header.slice(6).trim();
            let decoded = '';
            try {
                decoded = Buffer.from(b64, 'base64').toString('utf8');
            }
            catch {
                throw new common_1.UnauthorizedException('Invalid Basic auth encoding');
            }
            const idx = decoded.indexOf(':');
            if (idx < 0)
                throw new common_1.UnauthorizedException('Invalid Basic auth format');
            const user = decoded.slice(0, idx);
            const pass = decoded.slice(idx + 1);
            if (this.constantTimeEqual(user, expectedUser) &&
                this.constantTimeEqual(pass, expectedPass)) {
                return true;
            }
            throw new common_1.UnauthorizedException('Invalid webhook credentials');
        }
        throw new common_1.UnauthorizedException('Missing webhook credentials (expect Basic auth or ?token=)');
    }
    constantTimeEqual(a, b) {
        const aBuf = Buffer.from(a, 'utf8');
        const bBuf = Buffer.from(b, 'utf8');
        if (aBuf.length !== bBuf.length)
            return false;
        return (0, node_crypto_1.timingSafeEqual)(aBuf, bBuf);
    }
};
exports.PostmarkWebhookGuard = PostmarkWebhookGuard;
exports.PostmarkWebhookGuard = PostmarkWebhookGuard = PostmarkWebhookGuard_1 = __decorate([
    (0, common_1.Injectable)()
], PostmarkWebhookGuard);
//# sourceMappingURL=postmark-webhook.guard.js.map