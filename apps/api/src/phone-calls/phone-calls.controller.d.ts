import { PhoneCallsService } from './phone-calls.service';
import { PhoneCallService } from '../phone-call/phone-call.service';
import { CreatePhoneCallDto, UpdatePhoneCallDto } from './dto/create-phone-call.dto';
import { QueryPhoneCallDto } from './dto/query-phone-call.dto';
import type { AuthenticatedUser } from '@htownautos/auth';
export declare class PhoneCallsController {
    private readonly phoneCallsService;
    private readonly phoneCallService;
    constructor(phoneCallsService: PhoneCallsService, phoneCallService: PhoneCallService);
    private getTenantUserId;
    create(tenantId: string, createPhoneCallDto: CreatePhoneCallDto, user: AuthenticatedUser): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneMain: string;
            phoneMobile: string | null;
        } | null;
        transferredFrom: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
        transferredTo: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
        caller: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        buyerId: string | null;
        status: string;
        duration: number | null;
        callerId: string | null;
        direction: string;
        fromNumber: string;
        toNumber: string;
        startedAt: Date;
        answeredAt: Date | null;
        endedAt: Date | null;
        outcome: string | null;
        twilioCallSid: string | null;
        twilioRecordingSid: string | null;
        conferenceSid: string | null;
        conferenceName: string | null;
        segmentNumber: number;
        recordingUrl: string | null;
        recordingDuration: number | null;
        transcription: string | null;
        transcriptionStatus: string | null;
        aiSummary: string | null;
        aiSentiment: string | null;
        aiKeyPoints: import("@prisma/client/runtime/client").JsonValue | null;
        aiNextSteps: import("@prisma/client/runtime/client").JsonValue | null;
        transferredAt: Date | null;
        transferredToUserId: string | null;
        transferredFromUserId: string | null;
        transferReason: string | null;
        parentCallId: string | null;
    }>;
    findAll(tenantId: string, query: QueryPhoneCallDto, user: AuthenticatedUser): Promise<{
        data: ({
            buyer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phoneMain: string;
                phoneMobile: string | null;
            } | null;
            transferredFrom: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
            transferredTo: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
            caller: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            notes: string | null;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            buyerId: string | null;
            status: string;
            duration: number | null;
            callerId: string | null;
            direction: string;
            fromNumber: string;
            toNumber: string;
            startedAt: Date;
            answeredAt: Date | null;
            endedAt: Date | null;
            outcome: string | null;
            twilioCallSid: string | null;
            twilioRecordingSid: string | null;
            conferenceSid: string | null;
            conferenceName: string | null;
            segmentNumber: number;
            recordingUrl: string | null;
            recordingDuration: number | null;
            transcription: string | null;
            transcriptionStatus: string | null;
            aiSummary: string | null;
            aiSentiment: string | null;
            aiKeyPoints: import("@prisma/client/runtime/client").JsonValue | null;
            aiNextSteps: import("@prisma/client/runtime/client").JsonValue | null;
            transferredAt: Date | null;
            transferredToUserId: string | null;
            transferredFromUserId: string | null;
            transferReason: string | null;
            parentCallId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        canAccessRecordings: boolean;
    }>;
    getStats(tenantId: string, buyerId?: string, callerId?: string): Promise<{
        total: number;
        completed: number;
        missed: number;
        totalDuration: number;
        averageDuration: number;
    }>;
    findByBuyer(tenantId: string, buyerId: string, query: QueryPhoneCallDto, user: AuthenticatedUser): Promise<{
        data: ({
            buyer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phoneMain: string;
                phoneMobile: string | null;
            } | null;
            transferredFrom: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
            transferredTo: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
            caller: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            notes: string | null;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            buyerId: string | null;
            status: string;
            duration: number | null;
            callerId: string | null;
            direction: string;
            fromNumber: string;
            toNumber: string;
            startedAt: Date;
            answeredAt: Date | null;
            endedAt: Date | null;
            outcome: string | null;
            twilioCallSid: string | null;
            twilioRecordingSid: string | null;
            conferenceSid: string | null;
            conferenceName: string | null;
            segmentNumber: number;
            recordingUrl: string | null;
            recordingDuration: number | null;
            transcription: string | null;
            transcriptionStatus: string | null;
            aiSummary: string | null;
            aiSentiment: string | null;
            aiKeyPoints: import("@prisma/client/runtime/client").JsonValue | null;
            aiNextSteps: import("@prisma/client/runtime/client").JsonValue | null;
            transferredAt: Date | null;
            transferredToUserId: string | null;
            transferredFromUserId: string | null;
            transferReason: string | null;
            parentCallId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        canAccessRecordings: boolean;
    }>;
    findByPhoneNumbers(tenantId: string, phones: string, query: QueryPhoneCallDto, user: AuthenticatedUser): Promise<{
        data: ({
            buyer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phoneMain: string;
                phoneMobile: string | null;
            } | null;
            transferredFrom: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
            transferredTo: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
            caller: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            notes: string | null;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            buyerId: string | null;
            status: string;
            duration: number | null;
            callerId: string | null;
            direction: string;
            fromNumber: string;
            toNumber: string;
            startedAt: Date;
            answeredAt: Date | null;
            endedAt: Date | null;
            outcome: string | null;
            twilioCallSid: string | null;
            twilioRecordingSid: string | null;
            conferenceSid: string | null;
            conferenceName: string | null;
            segmentNumber: number;
            recordingUrl: string | null;
            recordingDuration: number | null;
            transcription: string | null;
            transcriptionStatus: string | null;
            aiSummary: string | null;
            aiSentiment: string | null;
            aiKeyPoints: import("@prisma/client/runtime/client").JsonValue | null;
            aiNextSteps: import("@prisma/client/runtime/client").JsonValue | null;
            transferredAt: Date | null;
            transferredToUserId: string | null;
            transferredFromUserId: string | null;
            transferReason: string | null;
            parentCallId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        canAccessRecordings: boolean;
    }>;
    getAvailableTransferTargets(tenantId: string, user: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        extension: string | null;
    }[]>;
    transferCall(tenantId: string, callSid: string, body: {
        targetUserId: string;
        reason?: string;
    }, user: AuthenticatedUser): Promise<{
        transferredFrom: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
        transferredTo: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        buyerId: string | null;
        status: string;
        duration: number | null;
        callerId: string | null;
        direction: string;
        fromNumber: string;
        toNumber: string;
        startedAt: Date;
        answeredAt: Date | null;
        endedAt: Date | null;
        outcome: string | null;
        twilioCallSid: string | null;
        twilioRecordingSid: string | null;
        conferenceSid: string | null;
        conferenceName: string | null;
        segmentNumber: number;
        recordingUrl: string | null;
        recordingDuration: number | null;
        transcription: string | null;
        transcriptionStatus: string | null;
        aiSummary: string | null;
        aiSentiment: string | null;
        aiKeyPoints: import("@prisma/client/runtime/client").JsonValue | null;
        aiNextSteps: import("@prisma/client/runtime/client").JsonValue | null;
        transferredAt: Date | null;
        transferredToUserId: string | null;
        transferredFromUserId: string | null;
        transferReason: string | null;
        parentCallId: string | null;
    }>;
    findOne(tenantId: string, id: string, user: AuthenticatedUser): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneMain: string;
            phoneMobile: string | null;
        } | null;
        transferredFrom: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
        transferredTo: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
        caller: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        buyerId: string | null;
        status: string;
        duration: number | null;
        callerId: string | null;
        direction: string;
        fromNumber: string;
        toNumber: string;
        startedAt: Date;
        answeredAt: Date | null;
        endedAt: Date | null;
        outcome: string | null;
        twilioCallSid: string | null;
        twilioRecordingSid: string | null;
        conferenceSid: string | null;
        conferenceName: string | null;
        segmentNumber: number;
        recordingUrl: string | null;
        recordingDuration: number | null;
        transcription: string | null;
        transcriptionStatus: string | null;
        aiSummary: string | null;
        aiSentiment: string | null;
        aiKeyPoints: import("@prisma/client/runtime/client").JsonValue | null;
        aiNextSteps: import("@prisma/client/runtime/client").JsonValue | null;
        transferredAt: Date | null;
        transferredToUserId: string | null;
        transferredFromUserId: string | null;
        transferReason: string | null;
        parentCallId: string | null;
    }>;
    update(tenantId: string, id: string, updatePhoneCallDto: UpdatePhoneCallDto): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneMain: string;
            phoneMobile: string | null;
        } | null;
        transferredFrom: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
        transferredTo: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
        caller: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        buyerId: string | null;
        status: string;
        duration: number | null;
        callerId: string | null;
        direction: string;
        fromNumber: string;
        toNumber: string;
        startedAt: Date;
        answeredAt: Date | null;
        endedAt: Date | null;
        outcome: string | null;
        twilioCallSid: string | null;
        twilioRecordingSid: string | null;
        conferenceSid: string | null;
        conferenceName: string | null;
        segmentNumber: number;
        recordingUrl: string | null;
        recordingDuration: number | null;
        transcription: string | null;
        transcriptionStatus: string | null;
        aiSummary: string | null;
        aiSentiment: string | null;
        aiKeyPoints: import("@prisma/client/runtime/client").JsonValue | null;
        aiNextSteps: import("@prisma/client/runtime/client").JsonValue | null;
        transferredAt: Date | null;
        transferredToUserId: string | null;
        transferredFromUserId: string | null;
        transferReason: string | null;
        parentCallId: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    resegmentTranscription(callSid: string): Promise<{
        success: boolean;
        segmentsUpdated: number;
        message: string;
    }>;
    resegmentAllTranscriptions(tenantId: string): Promise<{
        message: string;
        processed: number;
        errors: number;
        success: boolean;
    }>;
}
