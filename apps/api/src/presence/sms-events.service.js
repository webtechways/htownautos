"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SmsEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsEventsService = void 0;
const common_1 = require("@nestjs/common");
let SmsEventsService = SmsEventsService_1 = class SmsEventsService {
    logger = new common_1.Logger(SmsEventsService_1.name);
    server = null;
    setServer(server) {
        this.server = server;
        this.logger.log('Socket.IO server set for SMS events');
    }
    emitSmsCreated(sms) {
        if (!this.server) {
            this.logger.warn('Cannot emit sms_created: Socket server not initialized');
            return;
        }
        const room = `tenant:${sms.tenantId}`;
        this.server.to(room).emit('sms_created', {
            sms,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Emitted sms_created to ${room} for message ${sms.id}`);
    }
    emitSmsUpdated(sms) {
        if (!this.server) {
            this.logger.warn('Cannot emit sms_updated: Socket server not initialized');
            return;
        }
        const room = `tenant:${sms.tenantId}`;
        this.server.to(room).emit('sms_updated', {
            sms,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Emitted sms_updated to ${room} for message ${sms.id} (status: ${sms.status})`);
    }
};
exports.SmsEventsService = SmsEventsService;
exports.SmsEventsService = SmsEventsService = SmsEventsService_1 = __decorate([
    (0, common_1.Injectable)()
], SmsEventsService);
//# sourceMappingURL=sms-events.service.js.map