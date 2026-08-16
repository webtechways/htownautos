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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tasks_service_1 = require("./tasks.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const query_task_dto_1 = require("./dto/query-task.dto");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
let TasksController = class TasksController {
    tasksService;
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    getTenantUserId(user, tenantId) {
        const tenantUser = user.tenants?.find(t => t.tenantId === tenantId || t.tenant?.id === tenantId);
        if (!tenantUser) {
            throw new common_1.BadRequestException('User is not a member of this tenant');
        }
        return tenantUser.id;
    }
    create(tenantId, createTaskDto, user) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        return this.tasksService.create(tenantId, createTaskDto, tenantUserId);
    }
    findAll(tenantId, query) {
        return this.tasksService.findAll(tenantId, query);
    }
    getMyTasks(tenantId, user, query) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        return this.tasksService.getMyTasks(tenantId, tenantUserId, query);
    }
    findByBuyer(tenantId, buyerId, query) {
        return this.tasksService.findByBuyer(tenantId, buyerId, query);
    }
    findByVehicle(tenantId, vehicleId, query) {
        return this.tasksService.findByVehicle(tenantId, vehicleId, query);
    }
    findOne(tenantId, id) {
        return this.tasksService.findOne(tenantId, id);
    }
    update(tenantId, id, updateTaskDto, user) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        return this.tasksService.update(tenantId, id, updateTaskDto, tenantUserId);
    }
    remove(tenantId, id) {
        return this.tasksService.remove(tenantId, id);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new task',
        description: 'Creates a task and assigns it to a user in the tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Task created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Assigned user not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_task_dto_1.CreateTaskDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all tasks',
        description: 'Retrieves all tasks for the current tenant with optional filters',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of tasks' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_task_dto_1.QueryTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-tasks'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my tasks',
        description: 'Retrieves tasks assigned to the current user',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of tasks assigned to current user' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, query_task_dto_1.QueryTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "getMyTasks", null);
__decorate([
    (0, common_1.Get)('by-buyer/:buyerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tasks by buyer',
        description: 'Retrieves all tasks related to a specific buyer/customer',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of tasks for the buyer' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, query_task_dto_1.QueryTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findByBuyer", null);
__decorate([
    (0, common_1.Get)('by-vehicle/:vehicleId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tasks by vehicle',
        description: 'Retrieves all tasks related to a specific vehicle',
    }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of tasks for the vehicle' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('vehicleId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, query_task_dto_1.QueryTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findByVehicle", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get task by ID',
        description: 'Retrieves a single task by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Task UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update task',
        description: 'Updates a task by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Task UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_task_dto_1.UpdateTaskDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete task',
        description: 'Permanently deletes a task',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Task UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('Tasks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map