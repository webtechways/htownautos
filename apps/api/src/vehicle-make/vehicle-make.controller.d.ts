import { VehicleMakeService } from './vehicle-make.service';
import { CreateVehicleMakeDto } from './dto/create-vehicle-make.dto';
import { UpdateVehicleMakeDto } from './dto/update-vehicle-make.dto';
import { QueryVehicleMakeDto } from './dto/query-vehicle-make.dto';
import { VehicleMakeEntity } from './entities/vehicle-make.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class VehicleMakeController {
    private readonly vehicleMakeService;
    constructor(vehicleMakeService: VehicleMakeService);
    create(createVehicleMakeDto: CreateVehicleMakeDto): Promise<VehicleMakeEntity>;
    findAll(query: QueryVehicleMakeDto): Promise<PaginatedResponseDto<VehicleMakeEntity>>;
    findOne(id: string): Promise<VehicleMakeEntity>;
    update(id: string, updateVehicleMakeDto: UpdateVehicleMakeDto): Promise<VehicleMakeEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
