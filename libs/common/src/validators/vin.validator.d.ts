import { ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
export declare class IsValidVINConstraint implements ValidatorConstraintInterface {
    private readonly transliteration;
    private readonly weights;
    validate(vin: string): boolean;
    private validateCheckDigit;
    defaultMessage(): string;
}
export declare function IsValidVIN(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
