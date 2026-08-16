import { ShippoService } from '../shippo.service';
export declare class ShippoCustomsItemsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(page?: string, results?: string): Promise<unknown>;
    create(body: Record<string, unknown>): Promise<unknown>;
    get(id: string): Promise<import("shippo").CustomsItem>;
}
export declare class ShippoCustomsDeclarationsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(page?: string, results?: string): Promise<unknown>;
    create(body: Record<string, unknown>): Promise<unknown>;
    get(id: string): Promise<import("shippo").CustomsDeclaration>;
}
