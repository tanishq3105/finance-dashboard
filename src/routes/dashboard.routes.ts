import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import permission from "../middlewares/rbac.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dashboardController from "../controllers/dashboard.controller.js";

const router = Router();
router
  .route("/summary")
  .get(
    authMiddleware,
    permission("dashboard:read"),
    asyncHandler(dashboardController.getDashboardSummary)
  );
router
  .route("/by-category")
  .get(
    authMiddleware,
    permission("dashboard:insights"),
    asyncHandler(dashboardController.getDashboardTotalsByCategory)
  );
router
  .route("/trends")
  .get(
    authMiddleware,
    permission("dashboard:insights"),
    asyncHandler(dashboardController.getDashboardTrends)
  );
router
  .route("/recent")
  .get(
    authMiddleware,
    permission("dashboard:read"),
    asyncHandler(dashboardController.getRecentRecords)
  );
router
  .route("/top-categories")
  .get(
    authMiddleware,
    permission("dashboard:insights"),
    asyncHandler(dashboardController.getTopCategories)
  );

export default router;
