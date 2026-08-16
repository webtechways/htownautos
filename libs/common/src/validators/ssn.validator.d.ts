import { ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
export declare class IsValidSSNConstraint implements ValidatorConstraintInterface {
    validate(ssn: string): boolean;
    defaultMessage(): string;
}
export declare function IsValidSSN(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
