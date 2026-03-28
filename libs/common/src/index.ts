// Audit Module
export { AuditModule } from './audit.module';

// DTOs
export { PaginatedResponseDto, PaginationMeta } from './dto/paginated-response.dto';
export { PaginationDto } from './dto/pagination.dto';

// Decorators
export { AuditLog, AUDIT_LOG_KEY } from './decorators/audit-log.decorator';
export type { AuditLogMetadata } from './decorators/audit-log.decorator';
export { TransformEmptyToUndefined } from './decorators/transform-empty-to-undefined.decorator';

// Validators
export { IsValidSSN, IsValidSSNConstraint } from './validators/ssn.validator';
export { IsValidVIN, IsValidVINConstraint } from './validators/vin.validator';

// Pipes
export { GlobalValidationPipe } from './pipes/sanitize.pipe';

// Transformers
export { SanitizeString, NormalizeSSN, NormalizeVIN, NormalizeEmail, NormalizePhone, CapitalizeName, SanitizeURL } from './transformers/sanitize.transformer';

// Utils
export { normalizePhoneNumber, isValidE164, formatPhoneForDisplay, phoneNumbersMatch } from './utils/phone.utils';

// Interceptors
export { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
export { TenantInterceptor } from './interceptors/tenant.interceptor';

// S3 Service (shared across all apps)
export { S3Service } from './s3/s3.service';
export type { UploadResult, PresignResult, HeadObjectResult } from './s3/s3.service';

// Proxy Service
export { ProxyService } from './proxy/proxy.service';
