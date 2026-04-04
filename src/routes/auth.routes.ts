import { Router } from "express";
import authController from "../controllers/auth.controllers.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(asyncHandler(authController.register));
router.route("/login").post(asyncHandler(authController.login));
router
  .route("/logout")
  .post(authMiddleware, asyncHandler(authController.logout));
router
  .route("/me")
  .get(authMiddleware, asyncHandler(authController.getProfile));

export default router;
