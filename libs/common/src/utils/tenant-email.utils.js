"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugifyUsername = slugifyUsername;
exports.baseUsernameForUser = baseUsernameForUser;
exports.findAvailableUsername = findAvailableUsername;
exports.buildTenantEmail = buildTenantEmail;
exports.resolveTenantUserIdentity = resolveTenantUserIdentity;
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'htownautos.com';
function slugifyUsername(input) {
    const cleaned = (input || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9.\-_]+/g, '-')
        .replace(/^[.\-_]+|[.\-_]+$/g, '')
        .replace(/[-_.]{2,}/g, '-');
    return cleaned || 'user';
}
function baseUsernameForUser(user) {
    if (user.email) {
        const localPart = user.email.split('@')[0] || '';
        const slug = slugifyUsername(localPart);
        if (slug)
            return slug;
    }
    const fromName = slugifyUsername(`${user.firstName || ''}-${user.lastName || ''}`);
    if (fromName && fromName !== 'user')
        return fromName;
    return 'user';
}
async function findAvailableUsername(prisma, tenantId, base, excludeTenantUserId) {
    const slug = slugifyUsername(base);
    for (let i = 0; i < 50; i++) {
        const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
        const clash = await prisma.tenantUser.findFirst({
            where: {
                tenantId,
                username: candidate,
                ...(excludeTenantUserId ? { NOT: { id: excludeTenantUserId } } : {}),
            },
            select: { id: true },
        });
        if (!clash)
            return candidate;
    }
    return `${slug}-${Date.now().toString(36)}`;
}
function buildTenantEmail(username, subdomain) {
    if (!subdomain)
        return null;
    return `${username}@${subdomain}.${EMAIL_DOMAIN}`;
}
async function resolveTenantUserIdentity(prisma, tenantId, user, subdomain, excludeTenantUserId) {
    const base = baseUsernameForUser(user);
    const username = await findAvailableUsername(prisma, tenantId, base, excludeTenantUserId);
    const tenantEmail = buildTenantEmail(username, subdomain);
    return { username, tenantEmail };
}
//# sourceMappingURL=tenant-email.utils.js.map