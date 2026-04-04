import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import permission from "../middlewares/rbac.middleware.js";
import userController from "../controllers/user.controller.js";

const router = Router();
router
  .route("/")
  .get(
    authMiddleware,
    permission("users:manage"),
    asyncHandler(userController.getAllUsers)
  )
  .post(
    authMiddleware,
    permission("users:manage"),
    asyncHandler(userController.createUser)
  );
router
  .route("/:id")
  .get(
    authMiddleware,
    permission("users:manage"),
    asyncHandler(userController.getUserById)
  )
  .patch(
    authMiddleware,
    permission("users:manage"),
    asyncHandler(userController.updateUser)
  )
  .delete(
    authMiddleware,
    permission("users:manage"),
    asyncHandler(userController.deleteUser)
  );

router
  .route("/:id/role")
  .patch(
    authMiddleware,
    permission("users:manage"),
    asyncHandler(userController.changeUserRole)
  );
router
  .route("/:id/status")
  .patch(
    authMiddleware,
    permission("users:manage"),
    asyncHandler(userController.changeUserStatus)
  );

export default router;
