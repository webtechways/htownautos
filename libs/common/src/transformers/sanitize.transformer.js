"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizeString = SanitizeString;
exports.NormalizeSSN = NormalizeSSN;
exports.NormalizeVIN = NormalizeVIN;
exports.NormalizeEmail = NormalizeEmail;
exports.NormalizePhone = NormalizePhone;
exports.CapitalizeName = CapitalizeName;
exports.SanitizeURL = SanitizeURL;
const class_transformer_1 = require("class-transformer");
function SanitizeString() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value !== 'string')
            return value;
        return value
            .trim()
            .replace(/[<>]/g, '')
            .replace(/['"`;]/g, '')
            .replace(/\\/g, '');
    });
}
function NormalizeSSN() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return value;
        const digits = value.replace(/\D/g, '');
        if (digits.length !== 9)
            return value;
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
    });
}
function NormalizeVIN() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return value;
        return value
            .toUpperCase()
            .replace(/\s/g, '')
            .replace(/[^A-HJ-NPR-Z0-9]/g, '');
    });
}
function NormalizeEmail() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return value;
        return value.toLowerCase().trim();
    });
}
function NormalizePhone() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return value;
        const digits = value.replace(/\D/g, '');
        if (digits.length !== 10)
            return value;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    });
}
function CapitalizeName() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return value;
        return value
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    });
}
function SanitizeURL() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return value;
        try {
            const url = new URL(value);
            if (!['http:', 'https:'].includes(url.protocol)) {
                return null;
            }
            return url.toString();
        }
        catch {
            return null;
        }
    });
}
//# sourceMappingURL=sanitize.transformer.js.map