export declare class CreateParcelTemplateDto {
    name: string;
    carrier?: string;
    shippoTemplateToken?: string;
    length: number;
    width: number;
    height: number;
    distanceUnit?: 'in' | 'cm';
    defaultWeight?: number;
    massUnit?: 'lb' | 'kg';
    isDefault?: boolean;
}
export declare class UpdateParcelTemplateDto {
    name?: string;
    carrier?: string;
    shippoTemplateToken?: string;
    length?: number;
    width?: number;
    height?: number;
    distanceUnit?: 'in' | 'cm';
    defaultWeight?: number;
    massUnit?: 'lb' | 'kg';
    isDefault?: boolean;
}
