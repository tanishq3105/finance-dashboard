import { Router } from "express";
import auditController from "../controllers/audit.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import permission from "../middlewares/rbac.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router
  .route("/")
  .get(
    authMiddleware,
    permission("audit:read"),
    asyncHandler(auditController.getAuditLogs)
  );

router
  .route("/:userId")
  .get(
    authMiddleware,
    permission("audit:read"),
    asyncHandler(auditController.getLogbyUser)
  );

export default router;
