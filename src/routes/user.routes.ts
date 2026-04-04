import { Router } from "express";
import userControllers from "../controllers/user.controllers.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(asyncHandler(userControllers.register));
router.route("/login").post(asyncHandler(userControllers.login));
router
  .route("/logout")
  .post(authMiddleware, asyncHandler(userControllers.logout));
router
  .route("/me")
  .get(authMiddleware, asyncHandler(userControllers.getProfile));

export default router;
