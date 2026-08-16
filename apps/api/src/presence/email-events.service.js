"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailEventsService = void 0;
const common_1 = require("@nestjs/common");
let EmailEventsService = EmailEventsService_1 = class EmailEventsService {
    logger = new common_1.Logger(EmailEventsService_1.name);
    server = null;
    setServer(server) {
        this.server = server;
        this.logger.log('Socket.IO server set for Email events');
    }
    emitEmailCreated(email) {
        if (!this.server) {
            this.logger.warn('Cannot emit email_created: Socket server not initialized');
            return;
        }
        const room = `tenant:${email.tenantId}`;
        this.server.to(room).emit('email_created', {
            email,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Emitted email_created to ${room} for message ${email.id}`);
    }
    emitEmailUpdated(email) {
        if (!this.server) {
            this.logger.warn('Cannot emit email_updated: Socket server not initialized');
            return;
        }
        const room = `tenant:${email.tenantId}`;
        this.server.to(room).emit('email_updated', {
            email,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Emitted email_updated to ${room} for message ${email.id} (status: ${email.status})`);
    }
};
exports.EmailEventsService = EmailEventsService;
exports.EmailEventsService = EmailEventsService = EmailEventsService_1 = __decorate([
    (0, common_1.Injectable)()
], EmailEventsService);
//# sourceMappingURL=email-events.service.js.map