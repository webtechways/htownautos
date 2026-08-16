"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
class BuyerEntity {
    id;
    firstName;
    middleName;
    lastName;
    suffix;
    dateOfBirth;
    genderId;
    ssn;
    itin;
    citizenship;
    email;
    phoneMain;
    phoneSecondary;
    phoneMobile;
    preferredLanguageId;
    currentAddress;
    currentCity;
    currentState;
    currentZipCode;
    currentCountry;
    yearsAtAddress;
    monthsAtAddress;
    housingStatus;
    monthlyHousingCost;
    previousAddress;
    previousCity;
    previousState;
    previousZipCode;
    previousCountry;
    yearsAtPreviousAddress;
    monthsAtPreviousAddress;
    idTypeId;
    idNumber;
    idStateId;
    idExpirationDate;
    idIssueDate;
    driversLicenseNumber;
    driversLicenseState;
    driversLicenseExpiration;
    employmentStatusId;
    currentEmployer;
    employerPhone;
    occupationId;
    jobTitle;
    employerAddress;
    employerCity;
    employerState;
    employerZipCode;
    monthlyIncome;
    yearsEmployed;
    monthsEmployed;
    additionalIncome;
    additionalIncomeSource;
    previousEmployer;
    previousEmployerPhone;
    previousJobTitle;
    previousEmployerAddress;
    previousEmployerCity;
    previousEmployerState;
    previousEmployerZipCode;
    previousMonthlyIncome;
    previousYearsEmployed;
    previousMonthsEmployed;
    bankName;
    bankAccountType;
    bankRoutingNumber;
    bankAccountNumber;
    yearsWithBank;
    monthsWithBank;
    creditScore;
    bankruptcyHistory;
    bankruptcyDate;
    bankruptcyType;
    bankruptcyDischargeDate;
    repoHistory;
    repoDate;
    foreclosureHistory;
    foreclosureDate;
    currentMonthlyDebts;
    alimonyChildSupport;
    reference1Name;
    reference1Phone;
    reference1Relation;
    reference1Address;
    reference1YearsKnown;
    reference2Name;
    reference2Phone;
    reference2Relation;
    reference2Address;
    reference2YearsKnown;
    reference3Name;
    reference3Phone;
    reference3Relation;
    reference3Address;
    reference3YearsKnown;
    reference4Name;
    reference4Phone;
    reference4Relation;
    reference4Address;
    reference4YearsKnown;
    reference5Name;
    reference5Phone;
    reference5Relation;
    reference5Address;
    reference5YearsKnown;
    isBusinessBuyer;
    businessName;
    businessType;
    businessEIN;
    businessYearsInBusiness;
    businessAnnualRevenue;
    ofacCheckCompleted;
    ofacCheckDate;
    ofacCheckResult;
    ofacNotes;
    identityVerified;
    identityVerifiedDate;
    identityVerifiedBy;
    source;
    leadType;
    leadSource;
    inquiryType;
    contactMethod;
    contactTime;
    notes;
    createdAt;
    updatedAt;
    metaValue;
    tenantId;
    salesPersonId;
    bdcAgentId;
    stripeCustomerId;
    clerkUserId;
    fullName;
    constructor(partial) {
        Object.assign(this, partial);
        const decimalFields = [
            'monthlyHousingCost',
            'monthlyIncome',
            'additionalIncome',
            'previousMonthlyIncome',
            'currentMonthlyDebts',
            'alimonyChildSupport',
            'businessAnnualRevenue',
        ];
        for (const field of decimalFields) {
            if (partial[field] !== undefined && partial[field] !== null) {
                this[field] = Number(partial[field]);
            }
        }
        const parts = [this.firstName];
        if (this.middleName)
            parts.push(this.middleName.charAt(0) + '.');
        parts.push(this.lastName);
        if (this.suffix)
            parts.push(this.suffix);
        this.fullName = parts.join(' ');
    }
}
exports.BuyerEntity = BuyerEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Robert' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "middleName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jr' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "suffix", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1985-06-15T00:00:00.000Z' }),
    __metadata("design:type", Date)
], BuyerEntity.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "genderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SSN (masked)', example: '***-**-1234' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "ssn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "itin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'US Citizen' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "citizenship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@email.com' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '(555) 123-4567' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "phoneMain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '(555) 987-6543' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "phoneSecondary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '(555) 456-7890' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "phoneMobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "preferredLanguageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main St' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "currentAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Houston' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "currentCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TX' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "currentState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '77001' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "currentZipCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USA' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "currentCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "yearsAtAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 6 }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "monthsAtAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Own' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "housingStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1500.00, type: Number }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "monthlyHousingCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousZipCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "yearsAtPreviousAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "monthsAtPreviousAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "idTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "idNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "idStateId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "idExpirationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "idIssueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "driversLicenseNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "driversLicenseState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "driversLicenseExpiration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "employmentStatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "currentEmployer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "employerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "occupationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "employerAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "employerCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "employerState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "employerZipCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "monthlyIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "yearsEmployed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "monthsEmployed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "additionalIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "additionalIncomeSource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousEmployer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousEmployerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousJobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousEmployerAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousEmployerCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousEmployerState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousEmployerZipCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousMonthlyIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousYearsEmployed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "previousMonthsEmployed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "bankAccountType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "bankRoutingNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "yearsWithBank", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "monthsWithBank", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 720 }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "creditScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], BuyerEntity.prototype, "bankruptcyHistory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "bankruptcyDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "bankruptcyType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "bankruptcyDischargeDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], BuyerEntity.prototype, "repoHistory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "repoDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], BuyerEntity.prototype, "foreclosureHistory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "foreclosureDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "currentMonthlyDebts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "alimonyChildSupport", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference1Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference1Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference1Relation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference1Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference1YearsKnown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference2Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference2Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference2Relation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference2Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference2YearsKnown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference3Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference3Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference3Relation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference3Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference3YearsKnown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference4Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference4Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference4Relation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference4Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference4YearsKnown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference5Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference5Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference5Relation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference5Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "reference5YearsKnown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], BuyerEntity.prototype, "isBusinessBuyer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "businessType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "businessEIN", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "businessYearsInBusiness", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "businessAnnualRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], BuyerEntity.prototype, "ofacCheckCompleted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "ofacCheckDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "ofacCheckResult", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "ofacNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    __metadata("design:type", Boolean)
], BuyerEntity.prototype, "identityVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "identityVerifiedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "identityVerifiedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "leadType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "leadSource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "inquiryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "contactMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "contactTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-12T10:30:00.000Z' }),
    __metadata("design:type", Date)
], BuyerEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-12T10:30:00.000Z' }),
    __metadata("design:type", Date)
], BuyerEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "metaValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Assigned salesperson TenantUser ID' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "salesPersonId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Assigned BDC agent TenantUser ID' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "bdcAgentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stripe customer ID' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "stripeCustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Clerk user ID (portal auth)' }),
    __metadata("design:type", Object)
], BuyerEntity.prototype, "clerkUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John R. Doe Jr' }),
    __metadata("design:type", String)
], BuyerEntity.prototype, "fullName", void 0);
//# sourceMappingURL=buyer.entity.js.map