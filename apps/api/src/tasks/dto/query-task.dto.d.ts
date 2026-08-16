import { TaskStatus, TaskPriority } from './create-task.dto';
export declare class QueryTaskDto {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToId?: string;
    createdById?: string;
    buyerId?: string;
    vehicleId?: string;
    dealId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
