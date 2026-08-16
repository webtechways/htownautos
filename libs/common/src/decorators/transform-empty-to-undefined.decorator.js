"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformEmptyToUndefined = TransformEmptyToUndefined;
const class_transformer_1 = require("class-transformer");
function TransformEmptyToUndefined() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (value === '' || value === null) {
            return undefined;
        }
        return value;
    });
}
//# sourceMappingURL=transform-empty-to-undefined.decorator.js.map