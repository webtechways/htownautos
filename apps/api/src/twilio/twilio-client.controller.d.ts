import * as express from 'express';
import { TwilioService } from './twilio.service';
import { PrismaService } from '@htownautos/prisma';
import { PhoneCallService } from '../phone-call/phone-call.service';
export declare class TwilioClientController {
    private readonly twilioService;
    private readonly prisma;
    private readonly phoneCallService;
    private readonly logger;
    constructor(twilioService: TwilioService, prisma: PrismaService, phoneCallService: PhoneCallService);
    getVoiceToken(user: {
        id: string;
        email: string;
    }, tenantId: string): Promise<{
        token: string;
        identity: string;
        expiresIn: number;
    }>;
    private parseClientIdentity;
    handleOutgoingCall(body: Record<string, string>, res: express.Response): Promise<void>;
    handleOutgoingStatus(body: Record<string, string>, tenantId: string, res: express.Response): Promise<void>;
    handleOutgoingNumberStatus(body: Record<string, string>, tenantId: string, parentCallSid: string): Promise<{
        success: boolean;
    }>;
    handleIncomingClientCall(body: Record<string, string>, res: express.Response): Promise<void>;
    setupTwimlApp(): Promise<{
        twimlAppSid: string;
        message: string;
    }>;
}
