import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../validators/env.validator.js";
import { Request } from "../types/auth.types.js";
import { IjwtPayload } from "../types/jwt.types.js";
import { ApiError } from "../utils/apiError.js";
import { error } from "console";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.cookies.accessToken;
    if (!authHeader) {
      throw new ApiError(401, "Unauthorized");
    }

    const decoded = jwt.verify(
      authHeader,
      env.ACCESS_TOKEN_SECRET
    ) as IjwtPayload;
    req.user = decoded;
    next(error);
  } catch (error) {
    throw new ApiError(401, "Unauthorized");
  }
};

export default authMiddleware;
