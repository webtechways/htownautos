"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PhoneCallEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneCallEventsService = void 0;
const common_1 = require("@nestjs/common");
let PhoneCallEventsService = PhoneCallEventsService_1 = class PhoneCallEventsService {
    logger = new common_1.Logger(PhoneCallEventsService_1.name);
    server = null;
    setServer(server) {
        this.server = server;
        this.logger.log('Socket.IO server set for phone call events');
    }
    emitCallCreated(call) {
        if (!this.server) {
            this.logger.warn('Cannot emit call_created: Socket server not initialized');
            return;
        }
        const room = `tenant:${call.tenantId}`;
        this.server.to(room).emit('call_created', {
            call,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Emitted call_created to ${room} for call ${call.id}`);
    }
    emitCallUpdated(call) {
        if (!this.server) {
            this.logger.warn('Cannot emit call_updated: Socket server not initialized');
            return;
        }
        const room = `tenant:${call.tenantId}`;
        this.server.to(room).emit('call_updated', {
            call,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Emitted call_updated to ${room} for call ${call.id} (status: ${call.status})`);
    }
    emitCallCompleted(call) {
        if (!this.server) {
            this.logger.warn('Cannot emit call_completed: Socket server not initialized');
            return;
        }
        const room = `tenant:${call.tenantId}`;
        this.server.to(room).emit('call_completed', {
            call,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Emitted call_completed to ${room} for call ${call.id}`);
    }
};
exports.PhoneCallEventsService = PhoneCallEventsService;
exports.PhoneCallEventsService = PhoneCallEventsService = PhoneCallEventsService_1 = __decorate([
    (0, common_1.Injectable)()
], PhoneCallEventsService);
//# sourceMappingURL=phone-call-events.service.js.map