import { VehicleTrimService } from './vehicle-trim.service';
import { CreateVehicleTrimDto } from './dto/create-vehicle-trim.dto';
import { UpdateVehicleTrimDto } from './dto/update-vehicle-trim.dto';
import { QueryVehicleTrimDto } from './dto/query-vehicle-trim.dto';
import { VehicleTrimEntity } from './entities/vehicle-trim.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class VehicleTrimController {
    private readonly vehicleTrimService;
    constructor(vehicleTrimService: VehicleTrimService);
    create(createVehicleTrimDto: CreateVehicleTrimDto): Promise<VehicleTrimEntity>;
    findAll(query: QueryVehicleTrimDto): Promise<PaginatedResponseDto<VehicleTrimEntity>>;
    findOne(id: string): Promise<VehicleTrimEntity>;
    update(id: string, updateVehicleTrimDto: UpdateVehicleTrimDto): Promise<VehicleTrimEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
