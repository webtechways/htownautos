export interface AvailablePhoneNumber {
    phoneNumber: string;
    friendlyName: string;
    locality: string | null;
    region: string | null;
    postalCode: string | null;
    capabilities: {
        voice: boolean;
        sms: boolean;
        mms: boolean;
    };
}
export interface PurchasedPhoneNumber {
    sid: string;
    phoneNumber: string;
    friendlyName: string;
    capabilities: {
        voice: boolean;
        sms: boolean;
        mms: boolean;
    };
}
export declare class TwilioService {
    private readonly logger;
    private client;
    constructor();
    private ensureClient;
    searchByState(state: string, limit?: number): Promise<AvailablePhoneNumber[]>;
    searchByAreaCode(areaCode: string, limit?: number): Promise<AvailablePhoneNumber[]>;
    searchTollFree(limit?: number): Promise<AvailablePhoneNumber[]>;
    private buildWebhookUrl;
    purchaseNumber(phoneNumber: string, friendlyName: string, tenantId: string, phoneId: string, messagingServiceSid?: string): Promise<PurchasedPhoneNumber>;
    releaseNumber(twilioSid: string): Promise<void>;
    updateNumber(twilioSid: string, updates: {
        friendlyName?: string;
    }): Promise<void>;
    sendSms(params: {
        to: string;
        body: string;
        from?: string;
        messagingServiceSid?: string;
        statusCallback?: string;
    }): Promise<{
        sid: string;
        status: string;
    }>;
    validateWebhookSignature(signature: string, url: string, params: Record<string, string>): boolean;
    generateVoiceToken(userId: string, tenantId: string): {
        token: string;
        identity: string;
    };
    transferCall(callSid: string, targetNumber: string, callerId: string, options?: {
        announce?: string;
        timeout?: number;
        record?: boolean;
        recordingStatusCallback?: string;
    }): Promise<void>;
    getTransferDestination(tenantUserId: string): Promise<{
        type: 'client' | 'phone';
        destination: string;
    } | null>;
    callClient(clientIdentity: string, callerId: string, twiml: string, options?: {
        statusCallback?: string;
        timeout?: number;
        customParameters?: Record<string, string>;
    }): Promise<string>;
    callNumber(phoneNumber: string, callerId: string, twiml: string, options?: {
        statusCallback?: string;
        timeout?: number;
    }): Promise<string>;
    updateCallTwiml(callSid: string, twiml: string): Promise<void>;
    hangupCall(callSid: string): Promise<void>;
    getOrCreateTwimlApp(): Promise<string>;
}
