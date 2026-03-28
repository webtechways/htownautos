// Module
export { AuthModule } from './auth.module';

// Services
export { AuthService } from './auth.service';
export { CognitoService } from './cognito.service';

// Guards
export { CognitoJwtGuard } from './guards/cognito-jwt.guard';
export type { CognitoPayload, IdTokenPayload, AuthenticatedUser } from './guards/cognito-jwt.guard';
export { TenantGuard, TENANT_OPTIONAL_KEY, TENANT_ERROR_CODE } from './guards/tenant.guard';
export { RolesGuard } from './guards/roles.guard';
export { PermissionsGuard } from './guards/permissions.guard';

// Decorators
export { Public, IS_PUBLIC_KEY } from './decorators/public.decorator';
export { CurrentUser } from './decorators/current-user.decorator';
export { CurrentTenant } from './decorators/current-tenant.decorator';
export { TenantOptional } from './decorators/tenant-optional.decorator';
export { RequireRoles, ROLES_KEY, ADMIN_ROLES, OWNER_ONLY } from './decorators/roles.decorator';
export { RequirePermissions, PERMISSIONS_KEY } from './decorators/permissions.decorator';
