import { UserDocument } from "../types/user.types.js";
import { ApiError } from "./apiError.js";

export const generateAccessAndRefreshTokens = async (user: UserDocument) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens", [
      error instanceof Error ? error.message : error,
    ]);
  }
};
