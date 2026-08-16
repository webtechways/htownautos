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
var TwilioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioService = void 0;
const common_1 = require("@nestjs/common");
const twilio_1 = require("twilio");
const twilio_2 = require("twilio");
let TwilioService = TwilioService_1 = class TwilioService {
    logger = new common_1.Logger(TwilioService_1.name);
    client;
    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKeySid = process.env.TWILIO_SID;
        const apiKeySecret = process.env.TWILIO_SECRET;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (accountSid && apiKeySid && apiKeySecret) {
            this.client = new twilio_1.Twilio(apiKeySid, apiKeySecret, { accountSid });
            this.logger.log('Twilio initialized with API Key authentication');
        }
        else if (accountSid && authToken) {
            this.client = new twilio_1.Twilio(accountSid, authToken);
            this.logger.log('Twilio initialized with Account SID authentication');
        }
        else {
            this.logger.warn('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID + (TWILIO_SID & TWILIO_SECRET) or (TWILIO_AUTH_TOKEN)');
        }
    }
    ensureClient() {
        if (!this.client) {
            throw new common_1.BadRequestException('Twilio is not configured. Please set TWILIO_ACCOUNT_SID + (TWILIO_SID & TWILIO_SECRET) or TWILIO_AUTH_TOKEN.');
        }
    }
    async searchByState(state, limit = 10) {
        this.ensureClient();
        try {
            const numbers = await this.client.availablePhoneNumbers('US')
                .local.list({
                inRegion: state.toUpperCase(),
                voiceEnabled: true,
                smsEnabled: true,
                limit,
            });
            return numbers.map((n) => ({
                phoneNumber: n.phoneNumber,
                friendlyName: n.friendlyName,
                locality: n.locality,
                region: n.region,
                postalCode: n.postalCode,
                capabilities: {
                    voice: n.capabilities.voice,
                    sms: n.capabilities.sms,
                    mms: n.capabilities.mms,
                },
            }));
        }
        catch (error) {
            this.logger.error(`Error searching numbers by state: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to search numbers: ${error.message}`);
        }
    }
    async searchByAreaCode(areaCode, limit = 10) {
        this.ensureClient();
        if (!/^\d{3}$/.test(areaCode)) {
            throw new common_1.BadRequestException('Area code must be 3 digits');
        }
        try {
            const numbers = await this.client.availablePhoneNumbers('US')
                .local.list({
                areaCode: parseInt(areaCode, 10),
                voiceEnabled: true,
                smsEnabled: true,
                limit,
            });
            return numbers.map((n) => ({
                phoneNumber: n.phoneNumber,
                friendlyName: n.friendlyName,
                locality: n.locality,
                region: n.region,
                postalCode: n.postalCode,
                capabilities: {
                    voice: n.capabilities.voice,
                    sms: n.capabilities.sms,
                    mms: n.capabilities.mms,
                },
            }));
        }
        catch (error) {
            this.logger.error(`Error searching numbers by area code: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to search numbers: ${error.message}`);
        }
    }
    async searchTollFree(limit = 10) {
        this.ensureClient();
        try {
            const numbers = await this.client.availablePhoneNumbers('US')
                .tollFree.list({
                voiceEnabled: true,
                smsEnabled: true,
                limit,
            });
            return numbers.map((n) => ({
                phoneNumber: n.phoneNumber,
                friendlyName: n.friendlyName,
                locality: null,
                region: null,
                postalCode: null,
                capabilities: {
                    voice: n.capabilities.voice,
                    sms: n.capabilities.sms,
                    mms: n.capabilities.mms,
                },
            }));
        }
        catch (error) {
            this.logger.error(`Error searching toll-free numbers: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to search toll-free numbers: ${error.message}`);
        }
    }
    buildWebhookUrl(type, tenantId, phoneId) {
        const baseUrl = process.env.API_BASE_URL || 'https://api.htownautos.com';
        return `${baseUrl}/api/v1/twilio/${type}/incoming/${tenantId}/${phoneId}`;
    }
    async purchaseNumber(phoneNumber, friendlyName, tenantId, phoneId, messagingServiceSid) {
        this.ensureClient();
        const voiceUrl = this.buildWebhookUrl('voice', tenantId, phoneId);
        const smsUrl = this.buildWebhookUrl('sms', tenantId, phoneId);
        this.logger.log(`Configuring webhooks - Voice: ${voiceUrl}, SMS: ${smsUrl}`);
        try {
            const purchased = await this.client.incomingPhoneNumbers.create({
                phoneNumber,
                friendlyName: friendlyName || phoneNumber,
                voiceUrl,
                voiceMethod: 'POST',
                smsUrl,
                smsMethod: 'POST',
                statusCallback: this.buildWebhookUrl('voice', tenantId, phoneId) + '/status',
                statusCallbackMethod: 'POST',
            });
            if (messagingServiceSid) {
                try {
                    await this.client.messaging.v1
                        .services(messagingServiceSid)
                        .phoneNumbers.create({ phoneNumberSid: purchased.sid });
                    this.logger.log(`Phone number ${purchased.phoneNumber} associated with messaging service ${messagingServiceSid}`);
                }
                catch (msgError) {
                    this.logger.warn(`Failed to associate phone with messaging service: ${msgError.message}`);
                }
            }
            return {
                sid: purchased.sid,
                phoneNumber: purchased.phoneNumber,
                friendlyName: purchased.friendlyName,
                capabilities: {
                    voice: purchased.capabilities.voice,
                    sms: purchased.capabilities.sms,
                    mms: purchased.capabilities.mms,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error purchasing number: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to purchase number: ${error.message}`);
        }
    }
    async releaseNumber(twilioSid) {
        this.ensureClient();
        try {
            await this.client.incomingPhoneNumbers(twilioSid).remove();
        }
        catch (error) {
            this.logger.error(`Error releasing number: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to release number: ${error.message}`);
        }
    }
    async updateNumber(twilioSid, updates) {
        this.ensureClient();
        try {
            await this.client.incomingPhoneNumbers(twilioSid).update(updates);
        }
        catch (error) {
            this.logger.error(`Error updating number: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to update number: ${error.message}`);
        }
    }
    async sendSms(params) {
        this.ensureClient();
        if (!params.from && !params.messagingServiceSid) {
            throw new common_1.BadRequestException('Either from number or messagingServiceSid is required');
        }
        try {
            const message = await this.client.messages.create({
                to: params.to,
                body: params.body,
                ...(params.messagingServiceSid
                    ? { messagingServiceSid: params.messagingServiceSid }
                    : { from: params.from }),
                ...(params.statusCallback && { statusCallback: params.statusCallback }),
            });
            this.logger.log(`SMS sent to ${params.to}, SID: ${message.sid}`);
            return {
                sid: message.sid,
                status: message.status,
            };
        }
        catch (error) {
            this.logger.error(`Error sending SMS: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to send SMS: ${error.message}`);
        }
    }
    validateWebhookSignature(signature, url, params) {
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (!authToken) {
            this.logger.warn('Cannot validate signature: TWILIO_AUTH_TOKEN not set');
            return false;
        }
        const twilio = require('twilio');
        return twilio.validateRequest(authToken, signature, url, params);
    }
    generateVoiceToken(userId, tenantId) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKeySid = process.env.TWILIO_SID;
        const apiKeySecret = process.env.TWILIO_SECRET;
        const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;
        if (!accountSid || !apiKeySid || !apiKeySecret) {
            throw new common_1.BadRequestException('Twilio API credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_SID, and TWILIO_SECRET.');
        }
        if (!twimlAppSid) {
            throw new common_1.BadRequestException('TWILIO_TWIML_APP_SID not configured. Create a TwiML App in Twilio console.');
        }
        const clientIdentity = `${tenantId}:${userId}`;
        this.logger.log(`Voice token - userId: "${userId}", tenantId: "${tenantId}", clientIdentity: "${clientIdentity}"`);
        const AccessToken = twilio_2.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;
        const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
            identity: clientIdentity,
            ttl: 3600,
        });
        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: twimlAppSid,
            incomingAllow: true,
        });
        token.addGrant(voiceGrant);
        this.logger.log(`Generated voice token for identity: ${clientIdentity}`);
        return {
            token: token.toJwt(),
            identity: clientIdentity,
        };
    }
    async transferCall(callSid, targetNumber, callerId, options) {
        this.ensureClient();
        const { announce, timeout = 30, record = false, recordingStatusCallback } = options || {};
        const twilio = require('twilio');
        const twiml = new twilio.twiml.VoiceResponse();
        if (announce) {
            twiml.say({ voice: 'Polly.Joanna' }, announce);
        }
        const dialOptions = {
            callerId,
            timeout,
            action: '',
        };
        if (record) {
            dialOptions.record = 'record-from-answer';
            if (recordingStatusCallback) {
                dialOptions.recordingStatusCallback = recordingStatusCallback;
            }
        }
        const dial = twiml.dial(dialOptions);
        if (targetNumber.startsWith('client:')) {
            const client = dial.client({}, targetNumber.replace('client:', ''));
            client.parameter({ name: 'ParentCallSid', value: callSid });
        }
        else {
            dial.number(targetNumber);
        }
        try {
            await this.client.calls(callSid).update({
                twiml: twiml.toString(),
            });
            this.logger.log(`Call ${callSid} transferred to ${targetNumber}`);
        }
        catch (error) {
            this.logger.error(`Failed to transfer call ${callSid}: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to transfer call: ${error.message}`);
        }
    }
    async getTransferDestination(tenantUserId) {
        return null;
    }
    async callClient(clientIdentity, callerId, twiml, options) {
        this.ensureClient();
        try {
            let toField = `client:${clientIdentity}`;
            if (options?.customParameters && Object.keys(options.customParameters).length > 0) {
                const params = new URLSearchParams(options.customParameters).toString();
                toField = `client:${clientIdentity}?${params}`;
            }
            const callOptions = {
                to: toField,
                from: callerId,
                twiml,
            };
            if (options?.statusCallback) {
                callOptions.statusCallback = options.statusCallback;
                callOptions.statusCallbackEvent = ['initiated', 'ringing', 'answered', 'completed'];
                callOptions.statusCallbackMethod = 'POST';
            }
            if (options?.timeout) {
                callOptions.timeout = options.timeout;
            }
            const call = await this.client.calls.create(callOptions);
            this.logger.log(`Outbound call to client ${clientIdentity}: ${call.sid}`);
            return call.sid;
        }
        catch (error) {
            this.logger.error(`Failed to call client ${clientIdentity}: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to call client: ${error.message}`);
        }
    }
    async callNumber(phoneNumber, callerId, twiml, options) {
        this.ensureClient();
        try {
            const callOptions = {
                to: phoneNumber,
                from: callerId,
                twiml,
            };
            if (options?.statusCallback) {
                callOptions.statusCallback = options.statusCallback;
                callOptions.statusCallbackEvent = ['initiated', 'ringing', 'answered', 'completed'];
                callOptions.statusCallbackMethod = 'POST';
            }
            if (options?.timeout) {
                callOptions.timeout = options.timeout;
            }
            const call = await this.client.calls.create(callOptions);
            this.logger.log(`Outbound call to ${phoneNumber}: ${call.sid}`);
            return call.sid;
        }
        catch (error) {
            this.logger.error(`Failed to call ${phoneNumber}: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to call number: ${error.message}`);
        }
    }
    async updateCallTwiml(callSid, twiml) {
        this.ensureClient();
        try {
            await this.client.calls(callSid).update({ twiml });
            this.logger.log(`Updated call ${callSid} with new TwiML`);
        }
        catch (error) {
            this.logger.error(`Failed to update call ${callSid}: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to update call: ${error.message}`);
        }
    }
    async hangupCall(callSid) {
        this.ensureClient();
        try {
            await this.client.calls(callSid).update({ status: 'completed' });
            this.logger.log(`Hung up call ${callSid}`);
        }
        catch (error) {
            this.logger.error(`Failed to hang up call ${callSid}: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to hang up call: ${error.message}`);
        }
    }
    async getOrCreateTwimlApp() {
        this.ensureClient();
        const appName = 'HTown Autos CRM Voice Client';
        const baseUrl = process.env.API_BASE_URL || 'https://api.htownautos.com';
        const voiceUrl = `${baseUrl}/api/v1/twilio/client/outgoing`;
        try {
            const existingApps = await this.client.applications.list({ friendlyName: appName });
            if (existingApps.length > 0) {
                const app = await this.client.applications(existingApps[0].sid).update({
                    voiceUrl,
                    voiceMethod: 'POST',
                });
                this.logger.log(`Updated existing TwiML App: ${app.sid}`);
                return app.sid;
            }
            const app = await this.client.applications.create({
                friendlyName: appName,
                voiceUrl,
                voiceMethod: 'POST',
            });
            this.logger.log(`Created new TwiML App: ${app.sid}`);
            return app.sid;
        }
        catch (error) {
            this.logger.error(`Error managing TwiML App: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to manage TwiML App: ${error.message}`);
        }
    }
};
exports.TwilioService = TwilioService;
exports.TwilioService = TwilioService = TwilioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TwilioService);
//# sourceMappingURL=twilio.service.js.map