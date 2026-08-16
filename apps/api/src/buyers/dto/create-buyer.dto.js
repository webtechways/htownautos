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
exports.CreateBuyerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateBuyerDto {
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
    monthlyIncome;
    yearsEmployed;
    monthsEmployed;
    creditScore;
    isBusinessBuyer;
    businessName;
    businessEIN;
    source;
    leadType;
    leadSource;
    inquiryType;
    contactMethod;
    contactTime;
    notes;
    metaValue;
    salesPersonId;
    bdcAgentId;
}
exports.CreateBuyerDto = CreateBuyerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name', example: 'John' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Middle name', example: 'Robert' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "middleName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name', example: 'Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Suffix (Jr, Sr, III, etc)', example: 'Jr' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "suffix", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth', example: '1985-06-15' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gender UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "genderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Social Security Number (encrypted)', example: '***-**-1234' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "ssn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ITIN number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "itin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Citizenship', example: 'US Citizen' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "citizenship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address', example: 'john.doe@email.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Main phone number', example: '(555) 123-4567' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "phoneMain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Secondary phone', example: '(555) 987-6543' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "phoneSecondary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mobile phone', example: '(555) 456-7890' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "phoneMobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Preferred language UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "preferredLanguageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current street address', example: '123 Main St' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "currentAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current city', example: 'Houston' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "currentCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current state', example: 'TX' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "currentState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current ZIP code', example: '77001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "currentZipCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current country', example: 'USA', default: 'USA' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "currentCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Years at current address', example: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBuyerDto.prototype, "yearsAtAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Months at current address', example: 6 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(11),
    __metadata("design:type", Number)
], CreateBuyerDto.prototype, "monthsAtAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Housing status (Own, Rent, etc)', example: 'Own' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "housingStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Monthly housing cost', example: 1500.00 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBuyerDto.prototype, "monthlyHousingCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Previous street address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "previousAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Previous city' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "previousCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Previous state' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "previousState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Previous ZIP code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "previousZipCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Previous country' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "previousCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Years at previous address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBuyerDto.prototype, "yearsAtPreviousAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Months at previous address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(11),
    __metadata("design:type", Number)
], CreateBuyerDto.prototype, "monthsAtPreviousAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID type UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "idTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "idNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID state UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "idStateId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID expiration date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "idExpirationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID issue date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "idIssueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Driver's license number" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "driversLicenseNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Driver's license state" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "driversLicenseState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Driver's license expiration" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "driversLicenseExpiration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employment status UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "employmentStatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current employer name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "currentEmployer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employer phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "employerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Occupation UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "occupationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Job title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Monthly income', example: 5000.00 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBuyerDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Years employed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBuyerDto.prototype, "yearsEmployed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Months employed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(11),
    __metadata("design:type", Number)
], CreateBuyerDto.prototype, "monthsEmployed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Credit score', example: 720 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(300),
    (0, class_validator_1.Max)(850),
    __metadata("design:type", Number)
], CreateBuyerDto.prototype, "creditScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is this a business buyer?', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBuyerDto.prototype, "isBusinessBuyer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Business name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Business EIN' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "businessEIN", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Source of the buyer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lead type (internet, walk_in, phone, referral)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "leadType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lead source (website, facebook, google, etc)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "leadSource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Inquiry type (general, specific_vehicle, trade_in, financing)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "inquiryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Preferred contact method (phone, email, text)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "contactMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Preferred contact time (morning, afternoon, evening, anytime)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "contactTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes about the buyer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateBuyerDto.prototype, "metaValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Assigned salesperson (TenantUser ID)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "salesPersonId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Assigned BDC agent (TenantUser ID)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBuyerDto.prototype, "bdcAgentId", void 0);
//# sourceMappingURL=create-buyer.dto.js.map