"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PresenceGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const presence_service_1 = require("./presence.service");
const phone_call_events_service_1 = require("./phone-call-events.service");
const sms_events_service_1 = require("./sms-events.service");
const stripe_events_service_1 = require("./stripe-events.service");
const email_events_service_1 = require("./email-events.service");
const backend_1 = require("@clerk/backend");
let PresenceGateway = PresenceGateway_1 = class PresenceGateway {
    presenceService;
    phoneCallEventsService;
    smsEventsService;
    stripeEventsService;
    emailEventsService;
    server;
    logger = new common_1.Logger(PresenceGateway_1.name);
    socketUserMap = new Map();
    constructor(presenceService, phoneCallEventsService, smsEventsService, stripeEventsService, emailEventsService) {
        this.presenceService = presenceService;
        this.phoneCallEventsService = phoneCallEventsService;
        this.smsEventsService = smsEventsService;
        this.stripeEventsService = stripeEventsService;
        this.emailEventsService = emailEventsService;
    }
    afterInit() {
        this.logger.log('Presence WebSocket Gateway initialized');
        this.phoneCallEventsService.setServer(this.server);
        this.smsEventsService.setServer(this.server);
        this.stripeEventsService.setServer(this.server);
        this.emailEventsService.setServer(this.server);
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token;
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.emit('error', { message: 'Authentication required' });
                client.disconnect();
                return;
            }
            const payload = await (0, backend_1.verifyToken)(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            client.clerkUserId = payload.sub;
            const dbUserId = await this.presenceService.getUserIdFromClerkUserId(payload.sub);
            if (!dbUserId) {
                this.logger.warn(`User with clerkUserId ${payload.sub} not found in database`);
                client.emit('error', { message: 'User not found' });
                client.disconnect();
                return;
            }
            client.dbUserId = dbUserId;
            this.logger.log(`Client ${client.id} authenticated as user ${client.dbUserId}`);
            client.emit('authenticated', { userId: dbUserId });
        }
        catch (error) {
            this.logger.error(`Auth failed for client ${client.id}: ${error.message}`);
            client.emit('error', { message: 'Authentication failed' });
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        const mapping = this.socketUserMap.get(client.id);
        if (mapping) {
            const { userId, tenantId } = mapping;
            if (client.clerkUserId) {
                await this.presenceService.setUserOffline(client.clerkUserId, tenantId);
            }
            this.server.to(`tenant:${tenantId}`).emit('user_offline', {
                userId,
                timestamp: new Date().toISOString(),
            });
            this.socketUserMap.delete(client.id);
            this.logger.log(`User ${userId} disconnected from tenant ${tenantId}`);
        }
    }
    async handleJoinTenant(client, data) {
        const { tenantId } = data;
        if (!client.clerkUserId || !client.dbUserId) {
            client.emit('error', { message: 'Not authenticated' });
            return { success: false };
        }
        client.join(`tenant:${tenantId}`);
        client.tenantId = tenantId;
        this.socketUserMap.set(client.id, { userId: client.dbUserId, tenantId });
        await this.presenceService.setUserOnline(client.clerkUserId, tenantId);
        const room = `tenant:${tenantId}`;
        const socketsInRoom = await this.server.in(room).fetchSockets();
        this.logger.log(`Broadcasting user_online to ${socketsInRoom.length} sockets in room ${room}`);
        this.server.to(room).emit('user_online', {
            userId: client.dbUserId,
            timestamp: new Date().toISOString(),
        });
        const onlineUsers = await this.presenceService.getOnlineUsers(tenantId);
        client.emit('presence_sync', { users: onlineUsers });
        this.logger.log(`User ${client.dbUserId} joined tenant ${tenantId}`);
        return { success: true };
    }
    async handleLeaveTenant(client) {
        if (!client.tenantId || !client.clerkUserId || !client.dbUserId) {
            return { success: false };
        }
        const { tenantId, dbUserId, clerkUserId } = client;
        client.leave(`tenant:${tenantId}`);
        await this.presenceService.setUserOffline(clerkUserId, tenantId);
        this.server.to(`tenant:${tenantId}`).emit('user_offline', {
            userId: dbUserId,
            timestamp: new Date().toISOString(),
        });
        this.socketUserMap.delete(client.id);
        client.tenantId = undefined;
        this.logger.log(`User ${dbUserId} left tenant ${tenantId}`);
        return { success: true };
    }
    async handleHeartbeat(client) {
        if (!client.dbUserId || !client.tenantId) {
            return { success: false };
        }
        await this.presenceService.updateActivity(client.dbUserId, client.tenantId);
        return { success: true, timestamp: new Date().toISOString() };
    }
};
exports.PresenceGateway = PresenceGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PresenceGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_tenant'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PresenceGateway.prototype, "handleJoinTenant", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_tenant'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PresenceGateway.prototype, "handleLeaveTenant", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('heartbeat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PresenceGateway.prototype, "handleHeartbeat", null);
exports.PresenceGateway = PresenceGateway = PresenceGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/presence',
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [presence_service_1.PresenceService,
        phone_call_events_service_1.PhoneCallEventsService,
        sms_events_service_1.SmsEventsService,
        stripe_events_service_1.StripeEventsService,
        email_events_service_1.EmailEventsService])
], PresenceGateway);
//# sourceMappingURL=presence.gateway.js.map