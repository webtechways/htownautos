"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidSSNConstraint = void 0;
exports.IsValidSSN = IsValidSSN;
const class_validator_1 = require("class-validator");
let IsValidSSNConstraint = class IsValidSSNConstraint {
    validate(ssn) {
        if (!ssn)
            return true;
        const cleanSSN = ssn.replace(/-/g, '');
        if (!/^\d{9}$/.test(cleanSSN)) {
            return false;
        }
        const area = parseInt(cleanSSN.substring(0, 3), 10);
        const group = parseInt(cleanSSN.substring(3, 5), 10);
        const serial = parseInt(cleanSSN.substring(5, 9), 10);
        if (area === 0 || area === 666 || area >= 900) {
            return false;
        }
        if (group === 0) {
            return false;
        }
        if (serial === 0) {
            return false;
        }
        return true;
    }
    defaultMessage() {
        return 'Invalid SSN format. Must be XXX-XX-XXXX with valid area, group, and serial numbers';
    }
};
exports.IsValidSSNConstraint = IsValidSSNConstraint;
exports.IsValidSSNConstraint = IsValidSSNConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: false })
], IsValidSSNConstraint);
function IsValidSSN(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidSSNConstraint,
        });
    };
}
//# sourceMappingURL=ssn.validator.js.map