import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import permission from "../middlewares/rbac.middleware.js";
import recordsController from "../controllers/records.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router
  .route("/")
  .get(
    authMiddleware,
    permission("records:read"),
    asyncHandler(recordsController.getRecords)
  )
  .post(
    authMiddleware,
    permission("records:write"),
    asyncHandler(recordsController.createRecord)
  );
router
  .route("/:id")
  .get(
    authMiddleware,
    permission("records:read"),
    asyncHandler(recordsController.getRecordById)
  )
  .patch(
    authMiddleware,
    permission("records:write"),
    asyncHandler(recordsController.updateRecord)
  )
  .delete(
    authMiddleware,
    permission("records:delete"),
    asyncHandler(recordsController.deleteRecord)
  );
router
  .route("/:id/restore")
  .patch(
    authMiddleware,
    permission("records:delete"),
    asyncHandler(recordsController.restoreRecord)
  );
export default router;
