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
exports.AiTranslateController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("@htownautos/auth");
const ai_translate_service_1 = require("./ai-translate.service");
const translate_dto_1 = require("./dto/translate.dto");
let AiTranslateController = class AiTranslateController {
    aiTranslateService;
    constructor(aiTranslateService) {
        this.aiTranslateService = aiTranslateService;
    }
    translate(dto) {
        return this.aiTranslateService.translate(dto);
    }
};
exports.AiTranslateController = AiTranslateController;
__decorate([
    (0, common_1.Post)('translate'),
    (0, auth_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [translate_dto_1.TranslateDto]),
    __metadata("design:returntype", Promise)
], AiTranslateController.prototype, "translate", null);
exports.AiTranslateController = AiTranslateController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_translate_service_1.AiTranslateService])
], AiTranslateController);
//# sourceMappingURL=ai-translate.controller.js.map