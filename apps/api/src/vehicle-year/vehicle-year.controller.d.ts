import { VehicleYearService } from './vehicle-year.service';
import { CreateVehicleYearDto } from './dto/create-vehicle-year.dto';
import { UpdateVehicleYearDto } from './dto/update-vehicle-year.dto';
import { QueryVehicleYearDto } from './dto/query-vehicle-year.dto';
import { VehicleYearEntity } from './entities/vehicle-year.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class VehicleYearController {
    private readonly vehicleYearService;
    constructor(vehicleYearService: VehicleYearService);
    create(createVehicleYearDto: CreateVehicleYearDto): Promise<VehicleYearEntity>;
    findAll(query: QueryVehicleYearDto): Promise<PaginatedResponseDto<VehicleYearEntity>>;
    findOne(id: string): Promise<VehicleYearEntity>;
    update(id: string, updateVehicleYearDto: UpdateVehicleYearDto): Promise<VehicleYearEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
