"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidVINConstraint = void 0;
exports.IsValidVIN = IsValidVIN;
const class_validator_1 = require("class-validator");
let IsValidVINConstraint = class IsValidVINConstraint {
    transliteration = {
        A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
        J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
        S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
        '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    };
    weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    validate(vin) {
        if (!vin)
            return true;
        const vinUpper = vin.toUpperCase();
        if (vinUpper.length !== 17) {
            return false;
        }
        if (/[IOQ]/.test(vinUpper)) {
            return false;
        }
        if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vinUpper)) {
            return false;
        }
        return this.validateCheckDigit(vinUpper);
    }
    validateCheckDigit(vin) {
        let sum = 0;
        for (let i = 0; i < 17; i++) {
            const char = vin[i];
            const value = this.transliteration[char];
            if (value === undefined) {
                return false;
            }
            sum += value * this.weights[i];
        }
        const checkDigit = sum % 11;
        const expectedChar = checkDigit === 10 ? 'X' : checkDigit.toString();
        return vin[8] === expectedChar;
    }
    defaultMessage() {
        return 'Invalid VIN format. Must be 17 alphanumeric characters (excluding I, O, Q) with valid check digit';
    }
};
exports.IsValidVINConstraint = IsValidVINConstraint;
exports.IsValidVINConstraint = IsValidVINConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: false })
], IsValidVINConstraint);
function IsValidVIN(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidVINConstraint,
        });
    };
}
//# sourceMappingURL=vin.validator.js.map