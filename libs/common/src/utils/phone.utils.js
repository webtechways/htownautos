"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhoneNumber = normalizePhoneNumber;
exports.isValidE164 = isValidE164;
exports.formatPhoneForDisplay = formatPhoneForDisplay;
exports.phoneNumbersMatch = phoneNumbersMatch;
function normalizePhoneNumber(phone) {
    if (!phone)
        return null;
    const hasPlus = phone.startsWith('+');
    const digits = phone.replace(/\D/g, '');
    if (!digits)
        return null;
    if (digits.length === 10) {
        return `+1${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
    }
    if (digits.length > 11 && hasPlus) {
        return `+${digits}`;
    }
    if (digits.length >= 11) {
        return `+${digits}`;
    }
    return null;
}
function isValidE164(phone) {
    if (!phone)
        return false;
    return /^\+[1-9]\d{1,14}$/.test(phone);
}
function formatPhoneForDisplay(phone) {
    if (!phone)
        return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
        digits = digits.substring(1);
    }
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
}
function phoneNumbersMatch(phone1, phone2) {
    const normalized1 = normalizePhoneNumber(phone1);
    const normalized2 = normalizePhoneNumber(phone2);
    if (!normalized1 || !normalized2)
        return false;
    return normalized1 === normalized2;
}
//# sourceMappingURL=phone.utils.js.map