import { CallFlowService } from './call-flow.service';
import { CreateCallFlowDto, UpdateCallFlowDto, AssignCallFlowDto, CallFlowResponseDto } from './dto/call-flow.dto';
export declare class CallFlowController {
    private readonly callFlowService;
    constructor(callFlowService: CallFlowService);
    create(tenantId: string, dto: CreateCallFlowDto): Promise<CallFlowResponseDto>;
    findAll(tenantId: string): Promise<CallFlowResponseDto[]>;
    findOne(tenantId: string, id: string): Promise<CallFlowResponseDto>;
    update(tenantId: string, id: string, dto: UpdateCallFlowDto): Promise<CallFlowResponseDto>;
    delete(tenantId: string, id: string): Promise<void>;
    duplicate(tenantId: string, id: string, body: {
        name?: string;
    }): Promise<CallFlowResponseDto>;
}
export declare class PhoneNumberCallFlowController {
    private readonly callFlowService;
    constructor(callFlowService: CallFlowService);
    assignCallFlow(tenantId: string, phoneNumberId: string, dto: AssignCallFlowDto): Promise<void>;
    removeCallFlow(tenantId: string, phoneNumberId: string): Promise<void>;
}
