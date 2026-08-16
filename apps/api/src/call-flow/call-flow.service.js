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
var CallFlowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallFlowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const call_flow_dto_1 = require("./dto/call-flow.dto");
const tts_1 = require("@htownautos/tts");
let CallFlowService = CallFlowService_1 = class CallFlowService {
    prisma;
    ttsService;
    logger = new common_1.Logger(CallFlowService_1.name);
    constructor(prisma, ttsService) {
        this.prisma = prisma;
        this.ttsService = ttsService;
    }
    validateTerminalSteps(steps, path = 'root') {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const isTerminal = call_flow_dto_1.TERMINAL_STEP_TYPES.includes(step.type);
            if (isTerminal && i < steps.length - 1) {
                throw new common_1.BadRequestException(`Terminal step "${step.type}" at ${path}[${i}] must be the last step. ` +
                    `Found ${steps.length - i - 1} step(s) after it.`);
            }
            if (step.type === call_flow_dto_1.CallFlowStepType.MENU) {
                const config = step.config;
                config.options?.forEach((option, optIdx) => {
                    if (option.steps?.length) {
                        this.validateTerminalSteps(option.steps, `${path}[${i}].options[${optIdx}]`);
                    }
                });
                if (config.invalidInputSteps?.length) {
                    this.validateTerminalSteps(config.invalidInputSteps, `${path}[${i}].invalidInputSteps`);
                }
            }
            if (step.type === call_flow_dto_1.CallFlowStepType.SCHEDULE) {
                const config = step.config;
                config.branches?.forEach((branch, branchIdx) => {
                    if (branch.steps?.length) {
                        this.validateTerminalSteps(branch.steps, `${path}[${i}].branches[${branchIdx}].steps`);
                    }
                });
                if (config.fallbackSteps?.length) {
                    this.validateTerminalSteps(config.fallbackSteps, `${path}[${i}].fallbackSteps`);
                }
            }
        }
    }
    validateUniqueStepIds(steps, seenIds = new Set()) {
        for (const step of steps) {
            if (seenIds.has(step.id)) {
                throw new common_1.BadRequestException(`Duplicate step ID: "${step.id}"`);
            }
            seenIds.add(step.id);
            if (step.type === call_flow_dto_1.CallFlowStepType.MENU) {
                const config = step.config;
                config.options?.forEach((option) => {
                    if (option.steps?.length) {
                        this.validateUniqueStepIds(option.steps, seenIds);
                    }
                });
                if (config.invalidInputSteps?.length) {
                    this.validateUniqueStepIds(config.invalidInputSteps, seenIds);
                }
            }
            if (step.type === call_flow_dto_1.CallFlowStepType.SCHEDULE) {
                const config = step.config;
                config.branches?.forEach((branch) => {
                    if (branch.steps?.length) {
                        this.validateUniqueStepIds(branch.steps, seenIds);
                    }
                });
                if (config.fallbackSteps?.length) {
                    this.validateUniqueStepIds(config.fallbackSteps, seenIds);
                }
            }
        }
    }
    validateSteps(steps) {
        if (!steps || steps.length === 0) {
            return;
        }
        this.validateTerminalSteps(steps);
        this.validateUniqueStepIds(steps);
    }
    async generateTtsForMessage(message) {
        if (message.type !== 'tts')
            return false;
        if (!message.text?.trim())
            return false;
        if (message.generatedAudioUrl)
            return false;
        const voice = message.voice || tts_1.TtsVoice.ECHO;
        const result = await this.ttsService.generateTts(message.text, voice);
        message.generatedAudioUrl = result.audioUrl;
        this.logger.log(`Generated TTS audio for text: "${message.text.slice(0, 50)}..." -> ${result.audioUrl}`);
        return true;
    }
    async generateMissingTtsForSteps(steps) {
        let generatedCount = 0;
        for (const step of steps) {
            const config = step.config;
            if (config.message && typeof config.message === 'object') {
                if (await this.generateTtsForMessage(config.message)) {
                    generatedCount++;
                }
            }
            if (config.greeting && typeof config.greeting === 'object') {
                if (await this.generateTtsForMessage(config.greeting)) {
                    generatedCount++;
                }
            }
            if (step.type === call_flow_dto_1.CallFlowStepType.MENU) {
                const menuConfig = config;
                if (menuConfig.options) {
                    for (const option of menuConfig.options) {
                        if (option.steps?.length) {
                            generatedCount += await this.generateMissingTtsForSteps(option.steps);
                        }
                    }
                }
                if (menuConfig.invalidInputSteps?.length) {
                    generatedCount += await this.generateMissingTtsForSteps(menuConfig.invalidInputSteps);
                }
            }
            if (step.type === call_flow_dto_1.CallFlowStepType.SCHEDULE) {
                const scheduleConfig = config;
                if (scheduleConfig.branches) {
                    for (const branch of scheduleConfig.branches) {
                        if (branch.steps?.length) {
                            generatedCount += await this.generateMissingTtsForSteps(branch.steps);
                        }
                    }
                }
                if (scheduleConfig.fallbackSteps?.length) {
                    generatedCount += await this.generateMissingTtsForSteps(scheduleConfig.fallbackSteps);
                }
            }
        }
        return generatedCount;
    }
    toResponseDto(callFlow, phoneNumberCount) {
        return {
            id: callFlow.id,
            tenantId: callFlow.tenantId,
            name: callFlow.name,
            description: callFlow.description ?? undefined,
            isActive: callFlow.isActive,
            recordInboundCalls: callFlow.recordInboundCalls,
            steps: callFlow.steps,
            createdAt: callFlow.createdAt,
            updatedAt: callFlow.updatedAt,
            phoneNumberCount,
        };
    }
    async create(tenantId, dto) {
        if (dto.steps?.length) {
            this.validateSteps(dto.steps);
            const generatedCount = await this.generateMissingTtsForSteps(dto.steps);
            if (generatedCount > 0) {
                this.logger.log(`Generated ${generatedCount} TTS audio file(s) for new call flow`);
            }
        }
        const callFlow = await this.prisma.callFlow.create({
            data: {
                tenantId,
                name: dto.name,
                description: dto.description,
                isActive: dto.isActive ?? true,
                recordInboundCalls: dto.recordInboundCalls ?? false,
                steps: (dto.steps ?? []),
            },
            include: {
                _count: {
                    select: { phoneNumbers: true },
                },
            },
        });
        return this.toResponseDto(callFlow, callFlow._count.phoneNumbers);
    }
    async findAll(tenantId) {
        const callFlows = await this.prisma.callFlow.findMany({
            where: { tenantId },
            include: {
                _count: {
                    select: { phoneNumbers: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return callFlows.map((cf) => this.toResponseDto(cf, cf._count.phoneNumbers));
    }
    async findOne(tenantId, id) {
        const callFlow = await this.prisma.callFlow.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { phoneNumbers: true },
                },
                phoneNumbers: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        friendlyName: true,
                    },
                },
            },
        });
        if (!callFlow) {
            throw new common_1.NotFoundException(`Call flow with ID "${id}" not found`);
        }
        return this.toResponseDto(callFlow, callFlow._count.phoneNumbers);
    }
    async update(tenantId, id, dto) {
        this.logger.debug(`=== DEBUG: Update call flow ===`);
        this.logger.debug(`DTO received: ${JSON.stringify(dto, null, 2)}`);
        this.logger.debug(`Steps type: ${typeof dto.steps}, isArray: ${Array.isArray(dto.steps)}`);
        if (dto.steps) {
            this.logger.debug(`Steps length: ${dto.steps.length}`);
            dto.steps.forEach((step, idx) => {
                this.logger.debug(`Step ${idx}: type=${typeof step}, isArray=${Array.isArray(step)}, value=${JSON.stringify(step)}`);
            });
        }
        const existing = await this.prisma.callFlow.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Call flow with ID "${id}" not found`);
        }
        if (dto.steps?.length) {
            this.validateSteps(dto.steps);
            const generatedCount = await this.generateMissingTtsForSteps(dto.steps);
            if (generatedCount > 0) {
                this.logger.log(`Generated ${generatedCount} TTS audio file(s) for call flow update`);
            }
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        if (dto.recordInboundCalls !== undefined)
            updateData.recordInboundCalls = dto.recordInboundCalls;
        if (dto.steps !== undefined)
            updateData.steps = dto.steps;
        this.logger.debug(`Update data steps: ${JSON.stringify(updateData.steps, null, 2)}`);
        const callFlow = await this.prisma.callFlow.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: { phoneNumbers: true },
                },
            },
        });
        return this.toResponseDto(callFlow, callFlow._count.phoneNumbers);
    }
    async delete(tenantId, id) {
        const callFlow = await this.prisma.callFlow.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { phoneNumbers: true },
                },
            },
        });
        if (!callFlow) {
            throw new common_1.NotFoundException(`Call flow with ID "${id}" not found`);
        }
        if (callFlow._count.phoneNumbers > 0) {
            throw new common_1.BadRequestException(`Cannot delete call flow: it is assigned to ${callFlow._count.phoneNumbers} phone number(s). ` +
                `Unassign the phone numbers first.`);
        }
        await this.prisma.callFlow.delete({
            where: { id },
        });
    }
    async duplicate(tenantId, id, newName) {
        const original = await this.findOne(tenantId, id);
        return this.create(tenantId, {
            name: newName || `${original.name} (Copy)`,
            description: original.description,
            isActive: false,
            recordInboundCalls: original.recordInboundCalls,
            steps: original.steps,
        });
    }
    async assignToPhoneNumber(tenantId, phoneNumberId, callFlowId) {
        const phoneNumber = await this.prisma.twilioPhoneNumber.findFirst({
            where: { id: phoneNumberId, tenantId },
        });
        if (!phoneNumber) {
            throw new common_1.NotFoundException(`Phone number with ID "${phoneNumberId}" not found`);
        }
        if (callFlowId) {
            const callFlow = await this.prisma.callFlow.findFirst({
                where: { id: callFlowId, tenantId },
            });
            if (!callFlow) {
                throw new common_1.NotFoundException(`Call flow with ID "${callFlowId}" not found`);
            }
        }
        await this.prisma.twilioPhoneNumber.update({
            where: { id: phoneNumberId },
            data: { callFlowId },
        });
    }
    async getCallFlowForPhoneNumber(phoneNumberId) {
        const phoneNumber = await this.prisma.twilioPhoneNumber.findUnique({
            where: { id: phoneNumberId },
            include: {
                callFlow: true,
            },
        });
        if (!phoneNumber) {
            return null;
        }
        return {
            phoneNumber: {
                id: phoneNumber.id,
                phoneNumber: phoneNumber.phoneNumber,
                tenantId: phoneNumber.tenantId,
            },
            callFlow: phoneNumber.callFlow
                ? this.toResponseDto(phoneNumber.callFlow)
                : null,
        };
    }
    async findTenantUserByUserId(tenantId, userId) {
        const tenantUser = await this.prisma.tenantUser.findFirst({
            where: {
                tenantId,
                userId,
            },
            select: { id: true },
        });
        return tenantUser;
    }
};
exports.CallFlowService = CallFlowService;
exports.CallFlowService = CallFlowService = CallFlowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        tts_1.TtsService])
], CallFlowService);
//# sourceMappingURL=call-flow.service.js.map