export declare class CreateNoteDto {
    content: string;
    buyerId?: string;
    vehicleId?: string;
    dealId?: string;
}
declare const UpdateNoteDto_base: import("@nestjs/common").Type<Partial<CreateNoteDto>>;
export declare class UpdateNoteDto extends UpdateNoteDto_base {
}
export {};
