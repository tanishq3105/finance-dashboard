// import { Role } from "../types/rbac.types.js";
// import { Response, NextFunction } from "express";
// import { Request } from "../types/auth.types.js";

// const permissions = {
//     viewer: ['records:read', 'dashboard:read'],
//     analyst: ['records:read', 'dashboard:read', 'dashboard:insights'],
//     admin: ['records:read', 'records:write', 'records:delete',
//         'dashboard:read', 'dashboard:insights', 'users:manage'],
// };

// export const require = (...perms: Role[]) => (req: Request, res: Response, next: NextFunction) => {
//     const userPerms = permissions[req.user?.] ?? [];
//     const allowed = perms.every(p => userPerms.includes(p));
//     if (!allowed) return res.status(403).json({ error: 'Insufficient permissions' });
//     next();
// };
