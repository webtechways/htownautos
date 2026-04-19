import { Injectable, Logger } from '@nestjs/common';
import { AccountClient, ServerClient } from 'postmark';
import { Attachment } from 'postmark/dist/client/models/message/SupportingTypes';
import { DomainDetails } from 'postmark/dist/client/models/domains/Domain';
import { Server } from 'postmark/dist/client/models/server/Server';

export interface PostmarkAttachmentInput {
  filename: string;
  contentType: string;
  /** Base64 content, with or without "data:...;base64," prefix */
  content: string;
  /** For inline images; set Content-ID and use cid:<id> in HTML */
  contentId?: string;
}

export interface SendEmailInput {
  from: string; // e.g. '"Name" <user@tenant.htownautos.com>'
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  replyTo?: string;
  attachments?: PostmarkAttachmentInput[];
  tag?: string;
  metadata?: Record<string, string>;
  messageStream?: string; // defaults to "outbound"
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  errorCode?: number;
  errorMessage?: string;
}

export interface CreatedDomain {
  id: number;
  name: string;
  dkimHost: string;
  dkimTextValue: string;
  returnPathDomain: string;
  returnPathCNAMEValue: string;
  dkimVerified: boolean;
  returnPathVerified: boolean;
}

export interface CreatedServer {
  id: number;
  name: string;
  apiToken: string;
  inboundAddress: string;
  inboundDomain?: string;
}

export interface CreatedWebhook {
  id: number;
  url: string;
}

export interface WebhookTriggersInput {
  open?: boolean;
  click?: boolean;
  delivery?: boolean;
  bounce?: boolean;
  spamComplaint?: boolean;
  subscriptionChange?: boolean;
}

export interface BasicAuth {
  username: string;
  password: string;
}

@Injectable()
export class PostmarkService {
  private readonly logger = new Logger(PostmarkService.name);
  private readonly serverClient: ServerClient | null;
  private readonly accountClient: AccountClient | null;

  constructor() {
    const serverToken = process.env.POSTMARK_HTOWNAUTOS_SERVER_API_TOKEN;
    const accountToken = process.env.POSTMARK_ACCOUNT_API_TOKEN;

    this.serverClient = serverToken ? new ServerClient(serverToken) : null;
    this.accountClient = accountToken ? new AccountClient(accountToken) : null;

    if (!this.serverClient) {
      this.logger.warn('POSTMARK_HTOWNAUTOS_SERVER_API_TOKEN not set; email sending disabled');
    }
    if (!this.accountClient) {
      this.logger.warn('POSTMARK_ACCOUNT_API_TOKEN not set; domain management disabled');
    }
  }

  /**
   * Send an email using the default (system) Postmark server. Used for
   * invitations and other platform-level emails.
   */
  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    if (!this.serverClient) {
      return { success: false, errorMessage: 'Postmark server client not configured' };
    }
    return this.sendWithClient(this.serverClient, input);
  }

  /**
   * Send an email using a specific Postmark server token. Used for per-tenant
   * buyer emails so each dealership sends through its own server/inbox.
   */
  async sendEmailWithToken(serverToken: string, input: SendEmailInput): Promise<SendEmailResult> {
    if (!serverToken) {
      return { success: false, errorMessage: 'Missing Postmark server token for tenant' };
    }
    return this.sendWithClient(new ServerClient(serverToken), input);
  }

  private async sendWithClient(client: ServerClient, input: SendEmailInput): Promise<SendEmailResult> {
    const attachments = input.attachments?.map(
      (a) =>
        new Attachment(
          a.filename,
          this.stripDataUrl(a.content),
          a.contentType || 'application/octet-stream',
          a.contentId ?? null,
        ),
    );

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
    } catch (error: any) {
      this.logger.error(`Postmark sendEmail failed: ${error?.message || error}`);
      return {
        success: false,
        errorCode: error?.code,
        errorMessage: error?.message || 'Unknown Postmark error',
      };
    }
  }

  /**
   * Create a dedicated Postmark server for a tenant. The InboundDomain makes
   * Postmark accept `*@<inboundDomain>` when mail flows via the MX record.
   */
  async createServer(params: {
    name: string;
    color?: string;
    inboundDomain?: string;
    inboundHookUrl?: string;
    trackOpens?: boolean;
    trackLinks?: 'None' | 'TextOnly' | 'HtmlOnly' | 'HtmlAndText';
    rawEmailEnabled?: boolean;
  }): Promise<CreatedServer> {
    if (!this.accountClient) throw new Error('Postmark account client not configured');
    const server = (await this.accountClient.createServer({
      Name: params.name,
      Color: params.color || 'Blue',
      InboundDomain: params.inboundDomain,
      InboundHookUrl: params.inboundHookUrl,
      TrackOpens: params.trackOpens ?? true,
      TrackLinks: (params.trackLinks as any) || 'HtmlAndText',
      RawEmailEnabled: params.rawEmailEnabled ?? true,
    } as any)) as Server;

    const token = server.ApiTokens?.[0];
    if (!token) {
      // Defensive: Postmark always returns a token, but guard just in case.
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

  async updateServer(
    id: number,
    params: {
      inboundDomain?: string;
      inboundHookUrl?: string;
    },
  ): Promise<void> {
    if (!this.accountClient) throw new Error('Postmark account client not configured');
    await this.accountClient.editServer(id, {
      InboundDomain: params.inboundDomain,
      InboundHookUrl: params.inboundHookUrl,
    } as any);
  }

  async deleteServer(id: number): Promise<void> {
    if (!this.accountClient) throw new Error('Postmark account client not configured');
    await this.accountClient.deleteServer(id);
  }

  /**
   * Create a webhook on a specific server for outbound event tracking
   * (bounce, delivery, open, click, spam complaint). Uses per-server token.
   */
  async createOutboundWebhook(
    serverToken: string,
    params: {
      url: string;
      basicAuth?: BasicAuth;
      triggers?: WebhookTriggersInput;
    },
  ): Promise<CreatedWebhook> {
    const client = new ServerClient(serverToken);
    const t = params.triggers || {};
    const webhook = await client.createWebhook({
      Url: params.url,
      MessageStream: 'outbound',
      HttpAuth: params.basicAuth
        ? { Username: params.basicAuth.username, Password: params.basicAuth.password }
        : undefined,
      Triggers: {
        // PostFirstOpenOnly: true means Postmark only fires the webhook on the
        // FIRST open per recipient. Without this, the webhook fires on every
        // pixel reload (each time the email client re-renders the message),
        // flooding the WebSocket and the DB.
        Open: { Enabled: t.open ?? true, PostFirstOpenOnly: true },
        Click: { Enabled: t.click ?? true },
        Delivery: { Enabled: t.delivery ?? true },
        Bounce: { Enabled: t.bounce ?? true, IncludeContent: false },
        SpamComplaint: { Enabled: t.spamComplaint ?? true, IncludeContent: false },
        SubscriptionChange: { Enabled: t.subscriptionChange ?? false },
      },
    } as any);
    return { id: webhook.ID, url: webhook.Url };
  }

  /**
   * Create a verified sending domain in Postmark. Returns DKIM + Return-Path
   * DNS data that must be added to the DNS provider.
   */
  async createDomain(name: string): Promise<CreatedDomain> {
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

  async getDomain(id: number): Promise<CreatedDomain> {
    if (!this.accountClient) throw new Error('Postmark account client not configured');
    const res = await this.accountClient.getDomain(id);
    return this.toCreatedDomain(res);
  }

  /**
   * Find an existing Postmark sending domain by exact name. Useful when
   * reconciling from a partial provision failure.
   */
  async findDomainByName(name: string): Promise<CreatedDomain | null> {
    if (!this.accountClient) throw new Error('Postmark account client not configured');
    const target = name.toLowerCase();
    let offset = 0;
    const pageSize = 50;
    for (let i = 0; i < 20; i++) {
      const page: any = await this.accountClient.getDomains({ count: pageSize, offset } as any);
      const hit = page.Domains?.find((d: any) => d.Name?.toLowerCase() === target);
      if (hit) return this.toCreatedDomain(await this.accountClient.getDomain(hit.ID));
      if (!page.Domains || page.Domains.length < pageSize) return null;
      offset += pageSize;
    }
    return null;
  }

  async verifyDkim(id: number): Promise<CreatedDomain> {
    if (!this.accountClient) throw new Error('Postmark account client not configured');
    const res = await this.accountClient.verifyDomainDKIM(id);
    return this.toCreatedDomain(res);
  }

  async verifyReturnPath(id: number): Promise<CreatedDomain> {
    if (!this.accountClient) throw new Error('Postmark account client not configured');
    const res = await this.accountClient.verifyDomainReturnPath(id);
    return this.toCreatedDomain(res);
  }

  async deleteDomain(id: number): Promise<void> {
    if (!this.accountClient) throw new Error('Postmark account client not configured');
    await this.accountClient.deleteDomain(id);
  }

  private toCreatedDomain(d: DomainDetails): CreatedDomain {
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

  private stripDataUrl(content: string): string {
    const idx = content.indexOf('base64,');
    return idx >= 0 ? content.slice(idx + 'base64,'.length) : content;
  }
}
