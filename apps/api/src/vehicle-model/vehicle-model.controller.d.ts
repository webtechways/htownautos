import { VehicleModelService } from './vehicle-model.service';
import { CreateVehicleModelDto } from './dto/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dto/update-vehicle-model.dto';
import { QueryVehicleModelDto } from './dto/query-vehicle-model.dto';
import { VehicleModelEntity } from './entities/vehicle-model.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class VehicleModelController {
    private readonly vehicleModelService;
    constructor(vehicleModelService: VehicleModelService);
    create(createVehicleModelDto: CreateVehicleModelDto): Promise<VehicleModelEntity>;
    findAll(query: QueryVehicleModelDto): Promise<PaginatedResponseDto<VehicleModelEntity>>;
    findOne(id: string): Promise<VehicleModelEntity>;
    update(id: string, updateVehicleModelDto: UpdateVehicleModelDto): Promise<VehicleModelEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
