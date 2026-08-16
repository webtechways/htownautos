import { ShippoService } from '../shippo.service';
interface UserParcelTemplateBody {
    name: string;
    length: number | string;
    width: number | string;
    height: number | string;
    distanceUnit: 'in' | 'cm';
    weight?: number | string;
    weightUnit?: 'lb' | 'kg' | 'oz' | 'g';
}
export declare class ShippoUserParcelTemplatesController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(): Promise<unknown>;
    create(body: UserParcelTemplateBody): Promise<any>;
    get(id: string): Promise<unknown>;
    update(id: string, body: Partial<UserParcelTemplateBody>): Promise<any>;
    remove(id: string): Promise<any>;
}
export {};
