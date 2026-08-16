import { ShippoService } from '../shippo.service';
export declare class ShippoServiceGroupsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(): Promise<unknown>;
    create(body: Record<string, unknown>): Promise<unknown>;
    update(body: Record<string, unknown>): Promise<unknown>;
    remove(id: string): Promise<unknown>;
}
