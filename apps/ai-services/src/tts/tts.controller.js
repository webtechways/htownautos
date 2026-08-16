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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tts_service_1 = require("./tts.service");
const tts_dto_1 = require("./dto/tts.dto");
let TtsController = class TtsController {
    ttsService;
    constructor(ttsService) {
        this.ttsService = ttsService;
    }
    async generateTts(dto) {
        return this.ttsService.generateTts(dto.text, dto.voice);
    }
};
exports.TtsController = TtsController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Generate TTS audio from text' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audio generated successfully',
        type: tts_dto_1.TtsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Failed to generate audio',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tts_dto_1.GenerateTtsDto]),
    __metadata("design:returntype", Promise)
], TtsController.prototype, "generateTts", null);
exports.TtsController = TtsController = __decorate([
    (0, swagger_1.ApiTags)('TTS'),
    (0, common_1.Controller)('tts'),
    __metadata("design:paramtypes", [tts_service_1.TtsService])
], TtsController);
//# sourceMappingURL=tts.controller.js.map