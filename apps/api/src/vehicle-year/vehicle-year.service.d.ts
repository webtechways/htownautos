import { PrismaService } from '@htownautos/prisma';
import { CreateVehicleYearDto } from './dto/create-vehicle-year.dto';
import { UpdateVehicleYearDto } from './dto/update-vehicle-year.dto';
import { QueryVehicleYearDto } from './dto/query-vehicle-year.dto';
import { PaginatedResponseDto } from '@htownautos/common';
import { VehicleYearEntity } from './entities/vehicle-year.entity';
export declare class VehicleYearService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleNewYearCron(): Promise<void>;
    ensureYearExists(year: number): Promise<void>;
    create(createVehicleYearDto: CreateVehicleYearDto): Promise<VehicleYearEntity>;
    findAll(query: QueryVehicleYearDto): Promise<PaginatedResponseDto<VehicleYearEntity>>;
    findOne(id: string): Promise<VehicleYearEntity>;
    update(id: string, updateVehicleYearDto: UpdateVehicleYearDto): Promise<VehicleYearEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
