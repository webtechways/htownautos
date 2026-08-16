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
var PhoneCallService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneCallService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const transcription_service_1 = require("./transcription.service");
const twilio_service_1 = require("../twilio/twilio.service");
const phone_call_events_service_1 = require("../presence/phone-call-events.service");
const common_3 = require("@htownautos/common");
let PhoneCallService = PhoneCallService_1 = class PhoneCallService {
    prisma;
    s3Service;
    transcriptionService;
    twilioService;
    phoneCallEventsService;
    logger = new common_1.Logger(PhoneCallService_1.name);
    constructor(prisma, s3Service, transcriptionService, twilioService, phoneCallEventsService) {
        this.prisma = prisma;
        this.s3Service = s3Service;
        this.transcriptionService = transcriptionService;
        this.twilioService = twilioService;
        this.phoneCallEventsService = phoneCallEventsService;
    }
    async toCallEvent(call) {
        let caller = call.caller;
        let buyer = call.buyer;
        let transferredTo = call.transferredTo;
        let transferredFrom = call.transferredFrom;
        if (!caller && call.callerId) {
            caller = await this.prisma.tenantUser.findUnique({
                where: { id: call.callerId },
                include: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
            });
        }
        if (!buyer && call.buyerId) {
            buyer = await this.prisma.buyer.findUnique({
                where: { id: call.buyerId },
                select: { id: true, firstName: true, lastName: true, phoneMain: true },
            });
        }
        if (!transferredTo && call.transferredToUserId) {
            transferredTo = await this.prisma.tenantUser.findUnique({
                where: { id: call.transferredToUserId },
                include: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
            });
        }
        if (!transferredFrom && call.transferredFromUserId) {
            transferredFrom = await this.prisma.tenantUser.findUnique({
                where: { id: call.transferredFromUserId },
                include: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
            });
        }
        return {
            id: call.id,
            tenantId: call.tenantId,
            direction: call.direction,
            status: call.status,
            outcome: call.outcome,
            fromNumber: call.fromNumber,
            toNumber: call.toNumber,
            startedAt: call.startedAt?.toISOString() || new Date().toISOString(),
            answeredAt: call.answeredAt?.toISOString() || null,
            endedAt: call.endedAt?.toISOString() || null,
            duration: call.duration,
            buyerId: call.buyerId,
            callerId: call.callerId,
            recordingUrl: call.recordingUrl,
            transcription: call.transcription,
            transcriptionStatus: call.transcriptionStatus,
            caller: caller
                ? {
                    id: caller.id,
                    user: {
                        id: caller.user.id,
                        firstName: caller.user.firstName,
                        lastName: caller.user.lastName,
                        email: caller.user.email,
                    },
                }
                : null,
            buyer: buyer
                ? {
                    id: buyer.id,
                    firstName: buyer.firstName,
                    lastName: buyer.lastName,
                    phoneMain: buyer.phoneMain,
                }
                : null,
            transferredAt: call.transferredAt?.toISOString() || null,
            transferReason: call.transferReason || null,
            transferredTo: transferredTo
                ? {
                    id: transferredTo.id,
                    user: {
                        id: transferredTo.user.id,
                        firstName: transferredTo.user.firstName,
                        lastName: transferredTo.user.lastName,
                        email: transferredTo.user.email,
                    },
                }
                : null,
            transferredFrom: transferredFrom
                ? {
                    id: transferredFrom.id,
                    user: {
                        id: transferredFrom.user.id,
                        firstName: transferredFrom.user.firstName,
                        lastName: transferredFrom.user.lastName,
                        email: transferredFrom.user.email,
                    },
                }
                : null,
        };
    }
    async createCall(input) {
        const { tenantId, twilioCallSid, direction, fromNumber, toNumber, status, callerId } = input;
        this.logger.log(`createCall: direction=${direction}, from=${fromNumber}, to=${toNumber}, callerId=${callerId}, tenantId=${tenantId}`);
        const externalNumber = direction === 'inbound' ? fromNumber : toNumber;
        this.logger.log(`createCall: Looking up buyer by external number: ${externalNumber}`);
        const buyerId = await this.findBuyerByPhone(tenantId, externalNumber);
        const normalizedFrom = this.normalizePhone(fromNumber);
        const normalizedTo = this.normalizePhone(toNumber);
        const call = await this.prisma.phoneCall.create({
            data: {
                tenantId,
                twilioCallSid,
                direction,
                fromNumber: normalizedFrom,
                toNumber: normalizedTo,
                status: status || 'initiated',
                callerId: callerId || null,
                buyerId: buyerId || null,
                startedAt: new Date(),
            },
        });
        this.logger.log(`createCall: Created call ${call.id} - twilioSid=${twilioCallSid}, buyerId=${buyerId || 'none'}, callerId=${callerId || 'none'}`);
        this.phoneCallEventsService.emitCallCreated(await this.toCallEvent(call));
        return call;
    }
    async updateCallByTwilioSid(twilioCallSid, input) {
        const call = await this.prisma.phoneCall.findUnique({
            where: { twilioCallSid },
        });
        if (!call) {
            this.logger.warn(`Call not found for SID: ${twilioCallSid}`);
            return null;
        }
        const updated = await this.prisma.phoneCall.update({
            where: { twilioCallSid },
            data: input,
        });
        this.logger.log(`Updated call ${call.id}: status=${input.status || 'unchanged'}`);
        this.phoneCallEventsService.emitCallUpdated(await this.toCallEvent(updated));
        return updated;
    }
    async associateUserWithCall(twilioCallSid, userId) {
        const call = await this.prisma.phoneCall.findUnique({
            where: { twilioCallSid },
            select: { answeredAt: true },
        });
        const updated = await this.prisma.phoneCall.update({
            where: { twilioCallSid },
            data: {
                callerId: userId,
                ...(call && !call.answeredAt ? { answeredAt: new Date() } : {}),
            },
        });
        this.logger.log(`Updated call ${updated.id} with callerId=${userId}, answeredAt=${updated.answeredAt}`);
        return updated;
    }
    async getCallByTwilioSid(twilioCallSid) {
        return this.prisma.phoneCall.findUnique({
            where: { twilioCallSid },
            include: {
                buyer: true,
                caller: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
    async getCallByOriginalSidAndSegment(originalCallSid, segmentNumber) {
        const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
        return this.prisma.phoneCall.findFirst({
            where: { twilioCallSid, segmentNumber },
            include: {
                buyer: true,
                caller: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
    async getLatestCallSegment(inputCallSid) {
        const originalCallSid = inputCallSid.split('_transfer')[0];
        const allSegments = await this.prisma.phoneCall.findMany({
            where: {
                OR: [
                    { twilioCallSid: originalCallSid },
                    { twilioCallSid: { startsWith: `${originalCallSid}_transfer` } },
                ],
            },
            orderBy: { startedAt: 'desc' },
            include: {
                buyer: true,
                caller: { include: { user: true } },
            },
        });
        this.logger.log(`Found ${allSegments.length} segments for call ${originalCallSid}`);
        for (const segment of allSegments) {
            if (segment.status !== 'transferred') {
                this.logger.log(`Active segment found: ${segment.twilioCallSid} with status ${segment.status}`);
                return segment;
            }
        }
        this.logger.log(`All segments transferred, returning most recent`);
        return allSegments[0] || null;
    }
    async processRecording(twilioCallSid, twilioRecordingSid, recordingUrl, recordingDuration) {
        const originalCallSid = twilioCallSid.split('_transfer')[0];
        const allSegments = await this.prisma.phoneCall.findMany({
            where: {
                OR: [
                    { twilioCallSid: originalCallSid },
                    { twilioCallSid: { startsWith: `${originalCallSid}_transfer` } },
                ],
            },
            orderBy: { startedAt: 'asc' },
        });
        if (allSegments.length === 0) {
            this.logger.warn(`No call segments found for recording: ${twilioCallSid}`);
            return null;
        }
        this.logger.log(`Processing recording for ${allSegments.length} call segments: ${twilioCallSid}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            const s3Url = await this.uploadRecordingToS3(allSegments[0].tenantId, originalCallSid, twilioRecordingSid, recordingUrl);
            const updatePromises = allSegments.map((segment) => this.prisma.phoneCall.update({
                where: { id: segment.id },
                data: {
                    twilioRecordingSid,
                    recordingUrl: s3Url,
                    recordingDuration,
                    transcriptionStatus: segment.transcription ? segment.transcriptionStatus : 'pending',
                },
            }));
            const updated = await Promise.all(updatePromises);
            this.logger.log(`Recording uploaded for ${updated.length} segments: ${s3Url}`);
            for (const segment of updated) {
                this.phoneCallEventsService.emitCallUpdated(await this.toCallEvent(segment));
            }
            const lastSegmentSid = allSegments[allSegments.length - 1].twilioCallSid;
            if (lastSegmentSid) {
                this.transcriptionService.transcribeRecording(s3Url, lastSegmentSid).catch((err) => {
                    this.logger.error(`Background transcription failed for ${lastSegmentSid}: ${err.message}`);
                });
            }
            return updated[updated.length - 1];
        }
        catch (error) {
            this.logger.error(`Failed to process recording for ${twilioCallSid}: ${error.message}`);
            this.logger.error(`Error stack: ${error.stack}`);
            const updatePromises = allSegments.map((segment) => this.prisma.phoneCall.update({
                where: { id: segment.id },
                data: {
                    twilioRecordingSid,
                    recordingDuration,
                },
            }));
            const updated = await Promise.all(updatePromises);
            return updated[updated.length - 1];
        }
    }
    async processSegmentRecording(twilioCallSid, segmentNumber, twilioRecordingSid, recordingUrl, recordingDuration) {
        const constructedCallSid = this.constructTwilioCallSid(twilioCallSid, segmentNumber);
        const segment = await this.prisma.phoneCall.findFirst({
            where: {
                twilioCallSid: constructedCallSid,
                segmentNumber,
            },
        });
        if (!segment) {
            this.logger.warn(`No segment found for call ${twilioCallSid} (constructed: ${constructedCallSid}) segment ${segmentNumber}`);
            return null;
        }
        this.logger.log(`Processing recording for segment ${segmentNumber} of call ${constructedCallSid}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            const s3Url = await this.uploadRecordingToS3(segment.tenantId, `${twilioCallSid}_seg${segmentNumber}`, twilioRecordingSid, recordingUrl);
            const updated = await this.prisma.phoneCall.update({
                where: { id: segment.id },
                data: {
                    twilioRecordingSid,
                    recordingUrl: s3Url,
                    recordingDuration,
                    transcriptionStatus: 'pending',
                },
            });
            this.logger.log(`Segment ${segmentNumber} recording uploaded: ${s3Url}`);
            this.transcriptionService.transcribeSegmentRecording(s3Url, segment.id).catch((err) => {
                this.logger.error(`Segment transcription failed for ${segment.id}: ${err.message}`);
            });
            return updated;
        }
        catch (error) {
            this.logger.error(`Failed to process segment recording: ${error.message}`);
            await this.prisma.phoneCall.update({
                where: { id: segment.id },
                data: { twilioRecordingSid, recordingDuration },
            });
            return null;
        }
    }
    async updateConferenceInfo(originalCallSid, segmentNumber, conferenceSid, conferenceName) {
        const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
        const updated = await this.prisma.phoneCall.updateMany({
            where: {
                twilioCallSid,
                segmentNumber,
            },
            data: {
                conferenceSid,
                conferenceName,
            },
        });
        this.logger.log(`Updated conference info for ${twilioCallSid} segment ${segmentNumber}: ${conferenceSid}`);
        return updated;
    }
    async dialAgentIntoConference(originalCallSid, segmentNumber, conferenceName, tenantId) {
        const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
        const call = await this.prisma.phoneCall.findFirst({
            where: {
                twilioCallSid,
                segmentNumber,
            },
        });
        if (!call) {
            this.logger.warn(`Call not found for dialing agent: ${twilioCallSid} segment ${segmentNumber}`);
            return;
        }
        const metaValue = call.metaValue;
        const conferenceTarget = metaValue?.conferenceTarget;
        const callerId = metaValue?.conferenceCallerId || call.toNumber;
        const phoneNumberId = metaValue?.phoneNumberId;
        const stepIndex = metaValue?.stepIndex;
        const attemptIndex = metaValue?.attemptIndex;
        const dialTimeout = metaValue?.dialTimeout || 20;
        if (metaValue?.agentDialedFromTransfer) {
            this.logger.log(`Agent already dialed from transfer for ${twilioCallSid}, skipping dialAgentIntoConference`);
            return;
        }
        if (!conferenceTarget) {
            this.logger.warn(`No conference target found for call ${twilioCallSid}`);
            return;
        }
        const targets = conferenceTarget.split(',').map((t) => t.trim());
        this.logger.log(`Dialing ${targets.length} agent(s) into conference ${conferenceName} (timeout: ${dialTimeout}s)`);
        for (const target of targets) {
            try {
                await this.dialSingleAgentIntoConference(target, conferenceName, callerId, tenantId, originalCallSid, segmentNumber, dialTimeout, phoneNumberId, stepIndex, attemptIndex);
            }
            catch (error) {
                this.logger.error(`Failed to dial agent ${target} into conference: ${error.message}`);
            }
        }
    }
    async dialSingleAgentIntoConference(target, conferenceName, callerId, tenantId, originalCallSid, segmentNumber, timeout = 20, phoneNumberId, stepIndex, attemptIndex) {
        const twiml = this.generateJoinConferenceTwiml(conferenceName);
        const baseUrl = process.env.API_BASE_URL || 'https://api.htownautos.com';
        let statusCallback = `${baseUrl}/api/v1/twilio/voice/agent-status/${tenantId}/${originalCallSid}/${segmentNumber}`;
        if (phoneNumberId !== undefined) {
            statusCallback += `?phoneId=${phoneNumberId}`;
            if (stepIndex !== undefined) {
                statusCallback += `&step=${stepIndex}`;
            }
            if (attemptIndex !== undefined) {
                statusCallback += `&attempt=${attemptIndex}`;
            }
        }
        const callOptions = {
            statusCallback,
            timeout,
            customParameters: {
                ParentCallSid: originalCallSid,
            },
        };
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);
        const isEmail = target.includes('@');
        let agentCallSid = null;
        if (isUUID) {
            const clientIdentity = `${tenantId}:${target}`;
            this.logger.log(`Dialing agent client ${clientIdentity} into conference ${conferenceName} (timeout: ${timeout}s, ParentCallSid: ${originalCallSid})`);
            agentCallSid = await this.twilioService.callClient(clientIdentity, callerId, twiml, callOptions);
        }
        else if (isEmail) {
            const user = await this.prisma.user.findFirst({
                where: { email: { equals: target, mode: 'insensitive' } },
                select: { id: true },
            });
            if (user?.id) {
                const clientIdentity = `${tenantId}:${user.id}`;
                this.logger.log(`Dialing agent client ${clientIdentity} into conference ${conferenceName} (timeout: ${timeout}s, ParentCallSid: ${originalCallSid})`);
                agentCallSid = await this.twilioService.callClient(clientIdentity, callerId, twiml, callOptions);
            }
            else {
                this.logger.warn(`User not found for email ${target}`);
            }
        }
        else {
            this.logger.log(`Dialing phone ${target} into conference ${conferenceName} (timeout: ${timeout}s)`);
            agentCallSid = await this.twilioService.callNumber(target, callerId, twiml, { statusCallback, timeout });
        }
        if (agentCallSid) {
            const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
            const userId = isUUID ? target : undefined;
            await this.storeAgentCallSid(twilioCallSid, segmentNumber, agentCallSid, userId);
        }
        return agentCallSid;
    }
    constructTwilioCallSid(originalCallSid, segmentNumber) {
        if (segmentNumber === 0) {
            return originalCallSid;
        }
        return `${originalCallSid}_transfer_${segmentNumber}`;
    }
    async storeAgentCallSid(twilioCallSid, segmentNumber, agentCallSid, userId) {
        const call = await this.prisma.phoneCall.findFirst({
            where: { twilioCallSid, segmentNumber },
        });
        if (call) {
            const metaValue = call.metaValue || {};
            const agentCallSids = metaValue.agentCallSids || [];
            agentCallSids.push(agentCallSid);
            const agentCallSidToUserId = metaValue.agentCallSidToUserId || {};
            if (userId) {
                agentCallSidToUserId[agentCallSid] = userId;
            }
            await this.prisma.phoneCall.update({
                where: { id: call.id },
                data: {
                    metaValue: {
                        ...metaValue,
                        agentCallSids,
                        agentCallSidToUserId,
                    },
                },
            });
            this.logger.log(`Stored agent call SID ${agentCallSid} for call ${twilioCallSid}${userId ? ` (userId: ${userId})` : ''}`);
        }
    }
    generateJoinConferenceTwiml(conferenceName) {
        const twilio = require('twilio');
        const response = new twilio.twiml.VoiceResponse();
        const dial = response.dial();
        dial.conference({
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
        }, conferenceName);
        return response.toString();
    }
    async handleAgentJoinedConference(originalCallSid, segmentNumber, agentCallSid) {
        const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
        let call = await this.prisma.phoneCall.findFirst({
            where: { twilioCallSid, segmentNumber },
        });
        if (!call && segmentNumber === 0) {
            call = await this.prisma.phoneCall.findFirst({
                where: { twilioCallSid },
            });
            if (call) {
                this.logger.log(`handleAgentJoinedConference: Found call without segmentNumber filter`);
            }
        }
        if (!call) {
            this.logger.warn(`Call not found for agent join: ${twilioCallSid} segment ${segmentNumber}`);
            return { count: 0 };
        }
        const metaValue = call.metaValue || {};
        let conferenceTarget = metaValue.conferenceTarget;
        this.logger.log(`handleAgentJoinedConference: callSid=${twilioCallSid}, metaValue=${JSON.stringify(metaValue)}, conferenceTarget=${conferenceTarget}`);
        let answeringTenantUserId = null;
        if (!conferenceTarget && metaValue.phoneNumberId && metaValue.stepIndex !== undefined) {
            this.logger.log(`No conferenceTarget in metaValue, trying to get from call flow config`);
            try {
                const phoneNumber = await this.prisma.twilioPhoneNumber.findUnique({
                    where: { id: metaValue.phoneNumberId },
                    include: { callFlow: true },
                });
                if (phoneNumber?.callFlow?.steps) {
                    const steps = phoneNumber.callFlow.steps;
                    const step = steps[metaValue.stepIndex];
                    if (step) {
                        if (step.type === 'dial' && step.config?.destination) {
                            conferenceTarget = step.config.destination;
                            this.logger.log(`Got conferenceTarget from call flow DIAL step: ${conferenceTarget}`);
                        }
                        else if (step.type === 'simulcall' && step.config?.destinations?.length === 1) {
                            conferenceTarget = step.config.destinations[0];
                            this.logger.log(`Got conferenceTarget from call flow SIMULCALL step: ${conferenceTarget}`);
                        }
                        else if (step.type === 'round_robin' && step.config?.destinations) {
                            const attemptIndex = metaValue.attemptIndex || 0;
                            if (step.config.destinations[attemptIndex]) {
                                conferenceTarget = step.config.destinations[attemptIndex];
                                this.logger.log(`Got conferenceTarget from call flow ROUND_ROBIN step: ${conferenceTarget}`);
                            }
                        }
                    }
                }
            }
            catch (err) {
                this.logger.warn(`Failed to get conferenceTarget from call flow: ${err.message}`);
            }
        }
        if (conferenceTarget) {
            const targets = conferenceTarget.split(',').map((t) => t.trim());
            this.logger.log(`Targets parsed: ${JSON.stringify(targets)}, count=${targets.length}`);
            if (targets.length === 1) {
                const target = targets[0];
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);
                this.logger.log(`Single target: ${target}, isUUID=${isUUID}, isEmail=${target.includes('@')}`);
                if (isUUID) {
                    const tenantUser = await this.prisma.tenantUser.findFirst({
                        where: {
                            tenantId: call.tenantId,
                            user: { id: target },
                        },
                    });
                    this.logger.log(`TenantUser lookup by user.id=${target}: ${tenantUser ? `found id=${tenantUser.id}` : 'NOT FOUND'}`);
                    if (tenantUser) {
                        answeringTenantUserId = tenantUser.id;
                    }
                }
                else if (target.includes('@')) {
                    const tenantUser = await this.prisma.tenantUser.findFirst({
                        where: {
                            tenantId: call.tenantId,
                            user: { email: target },
                        },
                    });
                    this.logger.log(`TenantUser lookup by email=${target}: ${tenantUser ? `found id=${tenantUser.id}` : 'NOT FOUND'}`);
                    if (tenantUser) {
                        answeringTenantUserId = tenantUser.id;
                    }
                }
                else {
                    this.logger.warn(`Target ${target} is neither UUID nor email - cannot identify user`);
                }
            }
            else {
                const agentMapping = metaValue.agentCallSidToUserId || {};
                this.logger.log(`SIMULCALL: agentMapping=${JSON.stringify(agentMapping)}, agentCallSid=${agentCallSid}`);
                if (agentMapping[agentCallSid]) {
                    const userId = agentMapping[agentCallSid];
                    const tenantUser = await this.prisma.tenantUser.findFirst({
                        where: {
                            tenantId: call.tenantId,
                            user: { id: userId },
                        },
                    });
                    if (tenantUser) {
                        answeringTenantUserId = tenantUser.id;
                    }
                }
            }
        }
        else {
            this.logger.warn(`No conferenceTarget found in metaValue for call ${twilioCallSid}`);
        }
        const updateData = {
            status: 'in-progress',
            answeredAt: new Date(),
        };
        if (answeringTenantUserId) {
            updateData.callerId = answeringTenantUserId;
            this.logger.log(`Setting callerId to ${answeringTenantUserId} for call ${twilioCallSid}`);
        }
        const updatedCall = await this.prisma.phoneCall.update({
            where: { id: call.id },
            data: updateData,
        });
        this.phoneCallEventsService.emitCallUpdated(await this.toCallEvent(updatedCall));
        this.logger.log(`Agent ${agentCallSid} joined conference for ${twilioCallSid} segment ${segmentNumber}`);
        const agentCallSids = metaValue.agentCallSids || [];
        const otherAgentCalls = agentCallSids.filter((sid) => sid !== agentCallSid);
        if (otherAgentCalls.length > 0) {
            this.logger.log(`Terminating ${otherAgentCalls.length} other agent call(s) for SIMULCALL`);
            for (const otherCallSid of otherAgentCalls) {
                try {
                    await this.twilioService.hangupCall(otherCallSid);
                    this.logger.log(`Terminated other agent call ${otherCallSid}`);
                }
                catch (error) {
                    this.logger.warn(`Could not terminate other agent call ${otherCallSid}: ${error.message}`);
                }
            }
            await this.prisma.phoneCall.update({
                where: { id: call.id },
                data: {
                    metaValue: {
                        ...metaValue,
                        agentCallSids: [agentCallSid],
                    },
                },
            });
        }
        return { count: 1 };
    }
    async terminatePendingAgentCalls(originalCallSid, segmentNumber) {
        const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
        const call = await this.prisma.phoneCall.findFirst({
            where: { twilioCallSid, segmentNumber },
        });
        if (!call) {
            this.logger.warn(`Call not found for terminating agent calls: ${twilioCallSid} (original: ${originalCallSid}, segment: ${segmentNumber})`);
            return;
        }
        const metaValue = call.metaValue;
        const agentCallSids = metaValue?.agentCallSids || [];
        if (agentCallSids.length === 0) {
            this.logger.log(`No pending agent calls to terminate for ${twilioCallSid}`);
            return;
        }
        this.logger.log(`Terminating ${agentCallSids.length} pending agent call(s) for ${twilioCallSid}`);
        for (const agentCallSid of agentCallSids) {
            try {
                await this.twilioService.hangupCall(agentCallSid);
                this.logger.log(`Terminated agent call ${agentCallSid}`);
            }
            catch (error) {
                this.logger.warn(`Could not terminate agent call ${agentCallSid}: ${error.message}`);
            }
        }
        await this.prisma.phoneCall.update({
            where: { id: call.id },
            data: {
                metaValue: {
                    ...metaValue,
                    agentCallSids: [],
                },
            },
        });
    }
    async wasCallAnswered(twilioCallSid) {
        const call = await this.prisma.phoneCall.findFirst({
            where: { twilioCallSid },
            select: { status: true, answeredAt: true },
        });
        if (!call) {
            return false;
        }
        const wasAnswered = call.status === 'in-progress' ||
            call.status === 'completed' ||
            call.answeredAt !== null;
        this.logger.log(`wasCallAnswered(${twilioCallSid}): status=${call.status}, answeredAt=${call.answeredAt}, result=${wasAnswered}`);
        return wasAnswered;
    }
    async terminateCallerCall(twilioCallSid) {
        this.logger.log(`Terminating caller call: ${twilioCallSid}`);
        try {
            await this.twilioService.hangupCall(twilioCallSid);
            this.logger.log(`Caller call terminated: ${twilioCallSid}`);
        }
        catch (error) {
            this.logger.warn(`Could not terminate caller call ${twilioCallSid}: ${error.message}`);
        }
    }
    async redirectCallerCall(twilioCallSid, twiml) {
        this.logger.log(`Redirecting caller call: ${twilioCallSid}`);
        try {
            await this.twilioService.updateCallTwiml(twilioCallSid, twiml);
            this.logger.log(`Caller call redirected: ${twilioCallSid}`);
        }
        catch (error) {
            this.logger.warn(`Could not redirect caller call ${twilioCallSid}: ${error.message}`);
        }
    }
    async handleAgentCallStatus(originalCallSid, segmentNumber, agentCallSid, callStatus) {
        const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
        this.logger.log(`Agent call status: ${agentCallSid} -> ${callStatus} (caller: ${twilioCallSid}, segment: ${segmentNumber})`);
        const wasAnswered = callStatus === 'completed' || callStatus === 'in-progress';
        if (!wasAnswered) {
            this.logger.log(`Agent call ${agentCallSid} was not answered (status: ${callStatus})`);
            await this.removeAgentCallSid(originalCallSid, segmentNumber, agentCallSid);
            const call = await this.prisma.phoneCall.findFirst({
                where: { twilioCallSid, segmentNumber },
            });
            if (call) {
                const metaValue = call.metaValue;
                const remainingAgents = metaValue?.agentCallSids || [];
                if (remainingAgents.length === 0) {
                    this.logger.log(`No more pending agent calls for ${twilioCallSid}, caller should be redirected`);
                    await this.prisma.phoneCall.update({
                        where: { id: call.id },
                        data: {
                            metaValue: {
                                ...metaValue,
                                conferenceAttemptFailed: true,
                            },
                        },
                    });
                }
            }
        }
        else {
            this.logger.log(`Agent call ${agentCallSid} was answered`);
        }
        return wasAnswered;
    }
    async removeAgentCallSid(originalCallSid, segmentNumber, agentCallSid) {
        const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
        const call = await this.prisma.phoneCall.findFirst({
            where: { twilioCallSid, segmentNumber },
        });
        if (call) {
            const metaValue = call.metaValue || {};
            const agentCallSids = (metaValue.agentCallSids || []).filter((sid) => sid !== agentCallSid);
            await this.prisma.phoneCall.update({
                where: { id: call.id },
                data: {
                    metaValue: {
                        ...metaValue,
                        agentCallSids,
                    },
                },
            });
            this.logger.log(`Removed agent call SID ${agentCallSid} from call ${twilioCallSid}`);
        }
    }
    async didConferenceAttemptFail(originalCallSid, segmentNumber) {
        const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
        const call = await this.prisma.phoneCall.findFirst({
            where: { twilioCallSid, segmentNumber },
        });
        if (!call) {
            return false;
        }
        const metaValue = call.metaValue;
        return metaValue?.conferenceAttemptFailed === true;
    }
    async clearConferenceAttemptFailed(originalCallSid, segmentNumber) {
        const twilioCallSid = this.constructTwilioCallSid(originalCallSid, segmentNumber);
        const call = await this.prisma.phoneCall.findFirst({
            where: { twilioCallSid, segmentNumber },
        });
        if (call) {
            const metaValue = call.metaValue || {};
            delete metaValue.conferenceAttemptFailed;
            await this.prisma.phoneCall.update({
                where: { id: call.id },
                data: { metaValue },
            });
        }
    }
    async updateTranscription(twilioCallSid, transcription, status) {
        const originalCallSid = twilioCallSid.split('_transfer')[0];
        const allSegments = await this.prisma.phoneCall.findMany({
            where: {
                OR: [
                    { twilioCallSid: originalCallSid },
                    { twilioCallSid: { startsWith: `${originalCallSid}_transfer` } },
                ],
            },
            orderBy: { startedAt: 'asc' },
        });
        if (allSegments.length === 0) {
            const updated = await this.prisma.phoneCall.update({
                where: { twilioCallSid },
                data: { transcription, transcriptionStatus: status },
            });
            this.phoneCallEventsService.emitCallUpdated(await this.toCallEvent(updated));
            return updated;
        }
        if (allSegments.length === 1) {
            const updated = await this.prisma.phoneCall.update({
                where: { id: allSegments[0].id },
                data: { transcription, transcriptionStatus: status },
            });
            this.phoneCallEventsService.emitCallUpdated(await this.toCallEvent(updated));
            return updated;
        }
        let parsedTranscription = null;
        try {
            parsedTranscription = JSON.parse(transcription);
        }
        catch {
            this.logger.warn(`Could not parse transcription as JSON, applying to all segments`);
            const updatePromises = allSegments.map((segment) => this.prisma.phoneCall.update({
                where: { id: segment.id },
                data: { transcription, transcriptionStatus: status },
            }));
            const updated = await Promise.all(updatePromises);
            for (const segment of updated) {
                this.phoneCallEventsService.emitCallUpdated(await this.toCallEvent(segment));
            }
            return updated[updated.length - 1];
        }
        const callStartTime = allSegments[0].startedAt?.getTime() || 0;
        const updatePromises = allSegments.map((segment, index) => {
            const segmentStartTime = segment.startedAt?.getTime() || callStartTime;
            const segmentEndTime = segment.endedAt?.getTime() || Date.now();
            const segmentStartOffset = Math.max(0, (segmentStartTime - callStartTime) / 1000);
            const segmentEndOffset = (segmentEndTime - callStartTime) / 1000;
            this.logger.log(`Segment ${index} (${segment.twilioCallSid}): ${segmentStartOffset.toFixed(1)}s - ${segmentEndOffset.toFixed(1)}s`);
            let segmentTranscription;
            if (parsedTranscription?.segments && parsedTranscription.segments.length > 0) {
                const filteredSegments = parsedTranscription.segments.filter((ts) => {
                    return ts.start < segmentEndOffset && ts.end > segmentStartOffset;
                });
                const adjustedSegments = filteredSegments.map((ts) => ({
                    ...ts,
                    start: Math.max(0, ts.start - segmentStartOffset),
                    end: ts.end - segmentStartOffset,
                }));
                const filteredText = filteredSegments.map((s) => s.text).join(' ');
                const segmentDuration = segmentEndOffset - segmentStartOffset;
                segmentTranscription = JSON.stringify({
                    text: filteredText,
                    duration: segmentDuration,
                    segments: adjustedSegments,
                });
                this.logger.log(`Segment ${index}: ${filteredSegments.length} transcription segments (of ${parsedTranscription.segments.length} total)`);
            }
            else {
                segmentTranscription = transcription;
            }
            return this.prisma.phoneCall.update({
                where: { id: segment.id },
                data: { transcription: segmentTranscription, transcriptionStatus: status },
            });
        });
        const updated = await Promise.all(updatePromises);
        this.logger.log(`Transcription segmented for ${updated.length} call segments`);
        for (const segment of updated) {
            this.phoneCallEventsService.emitCallUpdated(await this.toCallEvent(segment));
        }
        return updated[updated.length - 1];
    }
    async findBuyerByPhone(tenantId, phoneNumber) {
        if (!phoneNumber) {
            this.logger.warn(`findBuyerByPhone: No phone number provided`);
            return null;
        }
        const normalized = (0, common_3.normalizePhoneNumber)(phoneNumber);
        const digits = phoneNumber.replace(/\D/g, '');
        const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
        this.logger.log(`findBuyerByPhone: input="${phoneNumber}", normalized="${normalized}", last10="${last10}", tenantId="${tenantId}"`);
        if (!normalized && !last10) {
            this.logger.warn(`findBuyerByPhone: Could not normalize or extract digits from: ${phoneNumber}`);
            return null;
        }
        const orConditions = [];
        if (normalized) {
            orConditions.push({ phoneMain: normalized });
            orConditions.push({ phoneSecondary: normalized });
            orConditions.push({ phoneMobile: normalized });
        }
        if (last10 && last10.length === 10) {
            orConditions.push({ phoneMain: { endsWith: last10 } });
            orConditions.push({ phoneSecondary: { endsWith: last10 } });
            orConditions.push({ phoneMobile: { endsWith: last10 } });
        }
        if (orConditions.length === 0) {
            this.logger.warn(`findBuyerByPhone: No valid search conditions for: ${phoneNumber}`);
            return null;
        }
        const buyer = await this.prisma.buyer.findFirst({
            where: {
                tenantId,
                OR: orConditions,
            },
            select: { id: true, phoneMain: true, phoneSecondary: true, phoneMobile: true },
        });
        if (buyer) {
            this.logger.log(`findBuyerByPhone: Found buyer ${buyer.id} for phone ${phoneNumber} (buyerPhones: main=${buyer.phoneMain}, secondary=${buyer.phoneSecondary}, mobile=${buyer.phoneMobile})`);
            return buyer.id;
        }
        else {
            this.logger.log(`findBuyerByPhone: No buyer found for phone ${phoneNumber} in tenant ${tenantId}`);
            return null;
        }
    }
    normalizePhone(phone) {
        return (0, common_3.normalizePhoneNumber)(phone) || phone;
    }
    async uploadRecordingToS3(tenantId, callSid, recordingSid, twilioUrl) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (!accountSid || !authToken) {
            throw new Error('Twilio credentials not configured');
        }
        const fullUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recordingSid}.mp3`;
        this.logger.log(`Downloading recording from Twilio: ${fullUrl}`);
        this.logger.log(`Using Account SID: ${accountSid.substring(0, 10)}...`);
        const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${authString}`,
            },
        });
        this.logger.log(`Twilio response status: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            this.logger.error(`Failed to download recording: ${response.status} ${response.statusText}`);
            this.logger.error(`Response body: ${errorText.substring(0, 500)}`);
            throw new Error(`Failed to download recording: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        this.logger.log(`Downloaded recording, size: ${buffer.length} bytes`);
        if (buffer.length === 0) {
            throw new Error('Downloaded recording is empty');
        }
        const folder = `tenants/${tenantId}/recordings/${callSid}`;
        const result = await this.s3Service.uploadBuffer(buffer, folder, 'mp3', 'audio/mpeg');
        this.logger.log(`Uploaded recording to S3: ${result.url}`);
        return result.url;
    }
    async getCallsForTenant(tenantId, options = {}) {
        const { page = 1, limit = 20, direction, buyerId, callerId, startDate, endDate } = options;
        const where = { tenantId };
        if (direction)
            where.direction = direction;
        if (buyerId)
            where.buyerId = buyerId;
        if (callerId)
            where.callerId = callerId;
        if (startDate || endDate) {
            where.startedAt = {};
            if (startDate)
                where.startedAt.gte = startDate;
            if (endDate)
                where.startedAt.lte = endDate;
        }
        const [calls, total] = await Promise.all([
            this.prisma.phoneCall.findMany({
                where,
                include: {
                    buyer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phoneMain: true,
                        },
                    },
                    caller: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    transferredTo: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    transferredFrom: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { startedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.phoneCall.count({ where }),
        ]);
        return {
            data: calls,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getCallsForBuyer(tenantId, buyerId) {
        return this.prisma.phoneCall.findMany({
            where: { tenantId, buyerId },
            include: {
                caller: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                transferredTo: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                transferredFrom: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { startedAt: 'desc' },
        });
    }
    async transferCall(twilioCallSid, transferToUserId, transferFromUserId, reason) {
        this.logger.log(`Transfer request: callSid=${twilioCallSid}, transferTo=${transferToUserId}, transferFrom=${transferFromUserId}`);
        let activeSegment = await this.getLatestCallSegment(twilioCallSid);
        if (!activeSegment) {
            this.logger.log(`Call not found by SID ${twilioCallSid}, searching in agentCallSids...`);
            const callWithAgent = await this.prisma.phoneCall.findFirst({
                where: {
                    status: 'in-progress',
                    metaValue: {
                        path: ['agentCallSids'],
                        array_contains: twilioCallSid,
                    },
                },
                orderBy: { startedAt: 'desc' },
                include: {
                    buyer: true,
                    caller: { include: { user: true } },
                },
            });
            if (callWithAgent) {
                this.logger.log(`Found call ${callWithAgent.twilioCallSid} containing agent SID ${twilioCallSid}`);
                activeSegment = callWithAgent;
            }
        }
        if (!activeSegment) {
            throw new common_1.BadRequestException('Call not found');
        }
        const call = await this.prisma.phoneCall.findUnique({
            where: { id: activeSegment.id },
            include: { tenant: true },
        });
        if (!call) {
            throw new common_1.BadRequestException('Call not found');
        }
        const callerCallSid = call.twilioCallSid;
        this.logger.log(`Transferring call segment: ${callerCallSid} (requested: ${twilioCallSid})`);
        const terminalStatuses = ['completed', 'failed', 'busy', 'no-answer', 'canceled', 'transferred'];
        if (terminalStatuses.includes(call.status)) {
            throw new common_1.BadRequestException(`Cannot transfer call with status: ${call.status}`);
        }
        const targetUser = await this.prisma.tenantUser.findUnique({
            where: { id: transferToUserId },
            include: {
                user: true,
                twilioPhoneNumber: true,
            },
        });
        if (!targetUser) {
            throw new common_1.BadRequestException('Target user not found');
        }
        const originalCallSid = callerCallSid ? callerCallSid.split('_transfer')[0] : null;
        if (!originalCallSid) {
            throw new common_1.BadRequestException('Original call SID not found');
        }
        const currentSegmentNumber = call.segmentNumber || 0;
        const newSegmentNumber = currentSegmentNumber + 1;
        const callerId = call.direction === 'inbound' ? call.toNumber : call.fromNumber;
        const newConferenceName = `call_${originalCallSid}_seg_${newSegmentNumber}`;
        const now = new Date();
        const startTime = call.answeredAt || call.startedAt;
        const segmentDuration = startTime ? Math.floor((now.getTime() - startTime.getTime()) / 1000) : null;
        this.logger.log(`Segment duration: ${segmentDuration}s. Creating new conference: ${newConferenceName}`);
        const updatedCall = await this.prisma.phoneCall.update({
            where: { id: call.id },
            data: {
                status: 'transferred',
                endedAt: now,
                duration: segmentDuration,
                transferredAt: now,
                transferredToUserId: transferToUserId,
                transferredFromUserId: transferFromUserId,
                transferReason: reason,
            },
            include: {
                transferredTo: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, email: true },
                        },
                    },
                },
                transferredFrom: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, email: true },
                        },
                    },
                },
            },
        });
        this.logger.log(`Transfer saved: transferredTo=${updatedCall.transferredTo?.user?.email || 'null'}, transferredFrom=${updatedCall.transferredFrom?.user?.email || 'null'}`);
        this.phoneCallEventsService.emitCallUpdated(await this.toCallEvent(updatedCall));
        const newCallSid = `${originalCallSid}_transfer_${newSegmentNumber}`;
        const newCallRecord = await this.prisma.phoneCall.create({
            data: {
                tenantId: call.tenantId,
                twilioCallSid: newCallSid,
                direction: call.direction,
                fromNumber: call.fromNumber,
                toNumber: call.toNumber,
                status: 'ringing',
                callerId: transferToUserId,
                buyerId: call.buyerId,
                startedAt: new Date(),
                segmentNumber: newSegmentNumber,
                conferenceName: newConferenceName,
                parentCallId: call.parentCallId || call.id,
                metaValue: {
                    conferenceTarget: targetUser.user.id,
                    conferenceCallerId: callerId,
                    agentDialedFromTransfer: true,
                },
            },
        });
        this.logger.log(`Created new transfer segment: ${newCallSid}, segment ${newSegmentNumber}`);
        this.phoneCallEventsService.emitCallCreated(await this.toCallEvent(newCallRecord));
        const baseUrl = process.env.API_BASE_URL || 'https://api.htownautos.com';
        const shouldRecord = true;
        const transferTwiml = this.generateTransferConferenceTwiml(newConferenceName, call.tenantId, originalCallSid, newSegmentNumber, shouldRecord, baseUrl);
        await this.twilioService.updateCallTwiml(originalCallSid, transferTwiml);
        const clientIdentity = `${call.tenantId}:${targetUser.user.id}`;
        const agentTwiml = this.generateJoinConferenceTwiml(newConferenceName);
        try {
            const agentStatusCallback = `${baseUrl}/api/v1/twilio/voice/agent-status/${call.tenantId}/${originalCallSid}/${newSegmentNumber}`;
            const newAgentCallSid = await this.twilioService.callClient(clientIdentity, callerId, agentTwiml, {
                statusCallback: agentStatusCallback,
                customParameters: {
                    ParentCallSid: originalCallSid,
                },
            });
            this.logger.log(`Dialed agent ${clientIdentity} into conference ${newConferenceName}, agentCallSid: ${newAgentCallSid}`);
            if (newAgentCallSid) {
                await this.storeAgentCallSid(newCallSid, newSegmentNumber, newAgentCallSid, targetUser.user.id);
            }
        }
        catch (error) {
            this.logger.error(`Failed to dial agent: ${error.message}`);
            const failedRecord = await this.prisma.phoneCall.update({
                where: { id: newCallRecord.id },
                data: { status: 'failed' },
            });
            this.phoneCallEventsService.emitCallUpdated(await this.toCallEvent(failedRecord));
            throw new common_1.BadRequestException('Failed to connect to agent');
        }
        this.logger.log(`Call ${twilioCallSid} transferred from user ${transferFromUserId} to user ${transferToUserId}. New segment: ${newCallSid}`);
        return updatedCall;
    }
    generateTransferConferenceTwiml(conferenceName, tenantId, callSid, segmentNumber, shouldRecord, baseUrl) {
        const twilio = require('twilio');
        const response = new twilio.twiml.VoiceResponse();
        response.say({ voice: 'Polly.Joanna' }, 'Please hold while we connect you.');
        const conferenceOptions = {
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
            waitUrl: `${baseUrl}/api/v1/twilio/voice/ring`,
            waitMethod: 'GET',
            statusCallback: `${baseUrl}/api/v1/twilio/voice/conference/${tenantId}/${callSid}/${segmentNumber}`,
            statusCallbackEvent: ['start', 'end', 'join', 'leave'],
            statusCallbackMethod: 'POST',
        };
        if (shouldRecord) {
            conferenceOptions.record = 'record-from-start';
            conferenceOptions.recordingStatusCallback = `${baseUrl}/api/v1/twilio/voice/recording/${tenantId}/${callSid}/${segmentNumber}`;
            conferenceOptions.recordingStatusCallbackMethod = 'POST';
        }
        const dial = response.dial();
        dial.conference(conferenceOptions, conferenceName);
        return response.toString();
    }
    async getAvailableTransferTargets(tenantId, excludeUserId) {
        const users = await this.prisma.tenantUser.findMany({
            where: {
                tenantId,
                isActive: true,
                status: 'active',
                ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                role: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                user: {
                    firstName: 'asc',
                },
            },
        });
        return users.map((tu) => ({
            id: tu.id,
            name: [tu.user.firstName, tu.user.lastName].filter(Boolean).join(' ') || tu.user.email,
            email: tu.user.email,
            avatar: tu.user.avatar,
            role: tu.role.name,
            extension: tu.extension,
        }));
    }
    async resegmentTranscription(twilioCallSid) {
        const originalCallSid = twilioCallSid.split('_transfer')[0];
        const completedSegment = await this.prisma.phoneCall.findFirst({
            where: {
                OR: [
                    { twilioCallSid: originalCallSid },
                    { twilioCallSid: { startsWith: `${originalCallSid}_transfer` } },
                ],
                status: 'completed',
                transcription: { not: null },
            },
        });
        if (!completedSegment?.transcription) {
            this.logger.warn(`No completed segment with transcription found for ${twilioCallSid}`);
            return 0;
        }
        await this.updateTranscription(completedSegment.twilioCallSid, completedSegment.transcription, 'completed');
        const count = await this.prisma.phoneCall.count({
            where: {
                OR: [
                    { twilioCallSid: originalCallSid },
                    { twilioCallSid: { startsWith: `${originalCallSid}_transfer` } },
                ],
            },
        });
        this.logger.log(`Re-segmented transcription for ${count} call segments`);
        return count;
    }
    async resegmentAllTranscriptionsForTenant(tenantId) {
        const callsWithTransfers = await this.prisma.phoneCall.findMany({
            where: {
                tenantId,
                twilioCallSid: {
                    not: { contains: '_transfer' },
                },
                transcription: { not: null },
            },
            select: { twilioCallSid: true },
        });
        let processed = 0;
        let errors = 0;
        for (const call of callsWithTransfers) {
            if (!call.twilioCallSid)
                continue;
            const transferCount = await this.prisma.phoneCall.count({
                where: {
                    twilioCallSid: { startsWith: `${call.twilioCallSid}_transfer` },
                },
            });
            if (transferCount > 0) {
                try {
                    await this.resegmentTranscription(call.twilioCallSid);
                    processed++;
                }
                catch (err) {
                    this.logger.error(`Failed to re-segment ${call.twilioCallSid}: ${err.message}`);
                    errors++;
                }
            }
        }
        this.logger.log(`Re-segmented transcriptions: ${processed} processed, ${errors} errors`);
        return { processed, errors };
    }
};
exports.PhoneCallService = PhoneCallService;
exports.PhoneCallService = PhoneCallService = PhoneCallService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => transcription_service_1.TranscriptionService))),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        common_2.S3Service,
        transcription_service_1.TranscriptionService,
        twilio_service_1.TwilioService,
        phone_call_events_service_1.PhoneCallEventsService])
], PhoneCallService);
//# sourceMappingURL=phone-call.service.js.map