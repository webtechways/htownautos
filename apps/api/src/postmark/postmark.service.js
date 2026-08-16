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
var PostmarkService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostmarkService = void 0;
const common_1 = require("@nestjs/common");
const postmark_1 = require("postmark");
const SupportingTypes_1 = require("postmark/dist/client/models/message/SupportingTypes");
let PostmarkService = PostmarkService_1 = class PostmarkService {
    logger = new common_1.Logger(PostmarkService_1.name);
    serverClient;
    accountClient;
    constructor() {
        const serverToken = process.env.POSTMARK_HTOWNAUTOS_SERVER_API_TOKEN;
        const accountToken = process.env.POSTMARK_ACCOUNT_API_TOKEN;
        this.serverClient = serverToken ? new postmark_1.ServerClient(serverToken) : null;
        this.accountClient = accountToken ? new postmark_1.AccountClient(accountToken) : null;
        if (!this.serverClient) {
            this.logger.warn('POSTMARK_HTOWNAUTOS_SERVER_API_TOKEN not set; email sending disabled');
        }
        if (!this.accountClient) {
            this.logger.warn('POSTMARK_ACCOUNT_API_TOKEN not set; domain management disabled');
        }
    }
    async sendEmail(input) {
        if (!this.serverClient) {
            return { success: false, errorMessage: 'Postmark server client not configured' };
        }
        return this.sendWithClient(this.serverClient, input);
    }
    async sendEmailWithToken(serverToken, input) {
        if (!serverToken) {
            return { success: false, errorMessage: 'Missing Postmark server token for tenant' };
        }
        return this.sendWithClient(new postmark_1.ServerClient(serverToken), input);
    }
    async sendWithClient(client, input) {
        const attachments = input.attachments?.map((a) => new SupportingTypes_1.Attachment(a.filename, this.stripDataUrl(a.content), a.contentType || 'application/octet-stream', a.contentId ?? null));
        try {
            const response = await client.sendEmail({
                From: input.from,
                To: input.to,
                Subject: input.subject,
                HtmlBody: input.htmlBody,
                TextBody: input.textBody,
                ReplyTo: input.replyTo,
                Tag: input.tag,
                Metadata: input.metadata,
                MessageStream: input.messageStream || 'outbound',
                Attachments: attachments,
            });
            return {
                success: response.ErrorCode === 0,
                messageId: response.MessageID,
                errorCode: response.ErrorCode,
                errorMessage: response.Message,
            };
        }
        catch (error) {
            this.logger.error(`Postmark sendEmail failed: ${error?.message || error}`);
            return {
                success: false,
                errorCode: error?.code,
                errorMessage: error?.message || 'Unknown Postmark error',
            };
        }
    }
    async createServer(params) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        const server = (await this.accountClient.createServer({
            Name: params.name,
            Color: params.color || 'Blue',
            InboundDomain: params.inboundDomain,
            InboundHookUrl: params.inboundHookUrl,
            TrackOpens: params.trackOpens ?? true,
            TrackLinks: params.trackLinks || 'HtmlAndText',
            RawEmailEnabled: params.rawEmailEnabled ?? true,
        }));
        const token = server.ApiTokens?.[0];
        if (!token) {
            throw new Error(`Postmark server ${server.ID} created without an API token`);
        }
        return {
            id: server.ID,
            name: server.Name,
            apiToken: token,
            inboundAddress: server.InboundAddress,
            inboundDomain: server.InboundDomain,
        };
    }
    async getServer(id) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        const server = (await this.accountClient.getServer(id));
        const token = server.ApiTokens?.[0];
        if (!token) {
            throw new Error(`Postmark server ${server.ID} has no API token`);
        }
        return {
            id: server.ID,
            name: server.Name,
            apiToken: token,
            inboundAddress: server.InboundAddress,
            inboundDomain: server.InboundDomain,
        };
    }
    async findServerByName(name) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        const target = name.toLowerCase();
        let offset = 0;
        const pageSize = 50;
        for (let i = 0; i < 20; i++) {
            const page = await this.accountClient.getServers({ count: pageSize, offset });
            const hit = page.Servers?.find((s) => s.Name?.toLowerCase() === target);
            if (hit)
                return this.getServer(hit.ID);
            if (!page.Servers || page.Servers.length < pageSize)
                return null;
            offset += pageSize;
        }
        return null;
    }
    async updateServer(id, params) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        await this.accountClient.editServer(id, {
            InboundDomain: params.inboundDomain,
            InboundHookUrl: params.inboundHookUrl,
        });
    }
    async deleteServer(id) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        await this.accountClient.deleteServer(id);
    }
    async createOutboundWebhook(serverToken, params) {
        const client = new postmark_1.ServerClient(serverToken);
        const t = params.triggers || {};
        const webhook = await client.createWebhook({
            Url: params.url,
            MessageStream: 'outbound',
            HttpAuth: params.basicAuth
                ? { Username: params.basicAuth.username, Password: params.basicAuth.password }
                : undefined,
            Triggers: {
                Open: { Enabled: t.open ?? true, PostFirstOpenOnly: true },
                Click: { Enabled: t.click ?? true },
                Delivery: { Enabled: t.delivery ?? true },
                Bounce: { Enabled: t.bounce ?? true, IncludeContent: false },
                SpamComplaint: { Enabled: t.spamComplaint ?? true, IncludeContent: false },
                SubscriptionChange: { Enabled: t.subscriptionChange ?? false },
            },
        });
        return { id: webhook.ID, url: webhook.Url };
    }
    async createDomain(name) {
        if (!this.accountClient) {
            throw new Error('Postmark account client not configured');
        }
        const returnPathDomain = `pm-bounces.${name}`;
        const res = await this.accountClient.createDomain({
            Name: name,
            ReturnPathDomain: returnPathDomain,
        });
        return this.toCreatedDomain(res);
    }
    async getDomain(id) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        const res = await this.accountClient.getDomain(id);
        return this.toCreatedDomain(res);
    }
    async findDomainByName(name) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        const target = name.toLowerCase();
        let offset = 0;
        const pageSize = 50;
        for (let i = 0; i < 20; i++) {
            const page = await this.accountClient.getDomains({ count: pageSize, offset });
            const hit = page.Domains?.find((d) => d.Name?.toLowerCase() === target);
            if (hit)
                return this.toCreatedDomain(await this.accountClient.getDomain(hit.ID));
            if (!page.Domains || page.Domains.length < pageSize)
                return null;
            offset += pageSize;
        }
        return null;
    }
    async verifyDkim(id) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        const res = await this.accountClient.verifyDomainDKIM(id);
        return this.toCreatedDomain(res);
    }
    async verifyReturnPath(id) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        const res = await this.accountClient.verifyDomainReturnPath(id);
        return this.toCreatedDomain(res);
    }
    async deleteDomain(id) {
        if (!this.accountClient)
            throw new Error('Postmark account client not configured');
        await this.accountClient.deleteDomain(id);
    }
    toCreatedDomain(d) {
        return {
            id: d.ID,
            name: d.Name,
            dkimHost: d.DKIMPendingHost || d.DKIMHost,
            dkimTextValue: d.DKIMPendingTextValue || d.DKIMTextValue,
            returnPathDomain: d.ReturnPathDomain,
            returnPathCNAMEValue: d.ReturnPathDomainCNAMEValue,
            dkimVerified: d.DKIMVerified,
            returnPathVerified: d.ReturnPathDomainVerified,
        };
    }
    stripDataUrl(content) {
        const idx = content.indexOf('base64,');
        return idx >= 0 ? content.slice(idx + 'base64,'.length) : content;
    }
};
exports.PostmarkService = PostmarkService;
exports.PostmarkService = PostmarkService = PostmarkService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PostmarkService);
//# sourceMappingURL=postmark.service.js.map