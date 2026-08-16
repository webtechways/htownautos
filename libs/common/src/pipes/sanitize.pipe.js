"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let GlobalValidationPipe = class GlobalValidationPipe {
    async transform(value, { metatype }) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = (0, class_transformer_1.plainToInstance)(metatype, value, {
            enableImplicitConversion: true,
            excludeExtraneousValues: false,
        });
        const errors = await (0, class_validator_1.validate)(object, {
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
            skipMissingProperties: false,
            validationError: {
                target: false,
                value: false,
            },
        });
        if (errors.length > 0) {
            const messages = this.buildErrorMessage(errors);
            throw new common_1.BadRequestException({
                message: 'Validation failed',
                errors: messages,
            });
        }
        return object;
    }
    toValidate(metatype) {
        const types = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
    buildErrorMessage(errors) {
        return errors.flatMap((error) => {
            if (error.constraints) {
                return Object.values(error.constraints);
            }
            if (error.children && error.children.length) {
                return this.buildErrorMessage(error.children);
            }
            return [];
        });
    }
};
exports.GlobalValidationPipe = GlobalValidationPipe;
exports.GlobalValidationPipe = GlobalValidationPipe = __decorate([
    (0, common_1.Injectable)()
], GlobalValidationPipe);
//# sourceMappingURL=sanitize.pipe.js.map