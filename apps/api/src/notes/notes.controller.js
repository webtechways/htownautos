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
exports.NotesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notes_service_1 = require("./notes.service");
const create_note_dto_1 = require("./dto/create-note.dto");
const query_note_dto_1 = require("./dto/query-note.dto");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
let NotesController = class NotesController {
    notesService;
    constructor(notesService) {
        this.notesService = notesService;
    }
    getTenantUserId(user, tenantId) {
        const tenantUser = user.tenants?.find((t) => t.tenantId === tenantId || t.tenant?.id === tenantId);
        if (!tenantUser) {
            throw new common_1.BadRequestException('User is not a member of this tenant');
        }
        return tenantUser.id;
    }
    create(tenantId, createNoteDto, user) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        return this.notesService.create(tenantId, createNoteDto, tenantUserId);
    }
    findAll(tenantId, query) {
        return this.notesService.findAll(tenantId, query);
    }
    findByBuyer(tenantId, buyerId, query) {
        return this.notesService.findByBuyer(tenantId, buyerId, query);
    }
    findOne(tenantId, id) {
        return this.notesService.findOne(tenantId, id);
    }
    update(tenantId, id, updateNoteDto) {
        return this.notesService.update(tenantId, id, updateNoteDto);
    }
    remove(tenantId, id) {
        return this.notesService.remove(tenantId, id);
    }
};
exports.NotesController = NotesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new note',
        description: 'Creates a rich text note associated with an entity',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Note created successfully' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_note_dto_1.CreateNoteDto, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all notes',
        description: 'Retrieves all notes for the current tenant with optional filters',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of notes' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_note_dto_1.QueryNoteDto]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-buyer/:buyerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get notes by buyer',
        description: 'Retrieves all notes related to a specific buyer/customer',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of notes for the buyer' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, query_note_dto_1.QueryNoteDto]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "findByBuyer", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get note by ID',
        description: 'Retrieves a single note by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Note UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Note found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Note not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update note',
        description: 'Updates a note by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Note UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Note updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Note not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_note_dto_1.UpdateNoteDto]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete note',
        description: 'Permanently deletes a note',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Note UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Note deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Note not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "remove", null);
exports.NotesController = NotesController = __decorate([
    (0, swagger_1.ApiTags)('Notes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notes'),
    __metadata("design:paramtypes", [notes_service_1.NotesService])
], NotesController);
//# sourceMappingURL=notes.controller.js.map