import { Response, NextFunction } from "express";
import { Request } from "../types/auth.types.js";
import { log } from "../utils/audit.service.js";

const methodActionMap: Record<string, string> = {
  POST: "CREATE",
  PATCH: "UPDATE",
  PUT: "UPDATE",
  DELETE: "DELETE",
  GET: "READ",
};

export function auditMiddleware(entity: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
      // only log successful mutating operations
      const action = methodActionMap[req.method];
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      const isMutation = req.method !== "GET";

      if (!action || !isSuccess || !isMutation || !req.user) return;

      const entityId = req.params.id ? Number(req.params.id) : undefined;
      log(req.user._id, action, entity, entityId);
    });

    next();
  };
}
