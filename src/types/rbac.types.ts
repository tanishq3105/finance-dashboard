const permissions = {
    viewer: ['records:read', 'dashboard:read'],
    analyst: ['records:read', 'dashboard:read', 'dashboard:insights'],
    admin: ['records:read', 'records:write', 'records:delete',
        'dashboard:read', 'dashboard:insights', 'users:manage'],
};

type permissions = typeof permissions;

export type Role = keyof permissions;