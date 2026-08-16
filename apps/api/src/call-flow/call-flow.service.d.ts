import { PrismaService } from '@htownautos/prisma';
import { CreateCallFlowDto, UpdateCallFlowDto, CallFlowResponseDto } from './dto/call-flow.dto';
import { TtsService } from '@htownautos/tts';
export declare class CallFlowService {
    private readonly prisma;
    private readonly ttsService;
    private readonly logger;
    constructor(prisma: PrismaService, ttsService: TtsService);
    private validateTerminalSteps;
    private validateUniqueStepIds;
    private validateSteps;
    private generateTtsForMessage;
    private generateMissingTtsForSteps;
    private toResponseDto;
    create(tenantId: string, dto: CreateCallFlowDto): Promise<CallFlowResponseDto>;
    findAll(tenantId: string): Promise<CallFlowResponseDto[]>;
    findOne(tenantId: string, id: string): Promise<CallFlowResponseDto>;
    update(tenantId: string, id: string, dto: UpdateCallFlowDto): Promise<CallFlowResponseDto>;
    delete(tenantId: string, id: string): Promise<void>;
    duplicate(tenantId: string, id: string, newName?: string): Promise<CallFlowResponseDto>;
    assignToPhoneNumber(tenantId: string, phoneNumberId: string, callFlowId: string | null): Promise<void>;
    getCallFlowForPhoneNumber(phoneNumberId: string): Promise<{
        callFlow: CallFlowResponseDto | null;
        phoneNumber: {
            id: string;
            phoneNumber: string;
            tenantId: string;
        };
    } | null>;
    findTenantUserByUserId(tenantId: string, userId: string): Promise<{
        id: string;
    } | null>;
}
