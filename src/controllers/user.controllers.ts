import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateAccessAndRefreshTokens } from "../utils/tokenGenerator.js";
import { loginSchema, registerSchema } from "../validators/user.validator.js";
import { CookieOptions, Response } from "express";
import { Request } from "../types/auth.types.js";
class UserController {
  async register(req: Request, res: Response) {
    const payload = req.body;
    //validate payload
    const parsedPayload = registerSchema.safeParse(payload);
    if (!parsedPayload.success) {
      throw new ApiError(400, parsedPayload.error.message);
    }
    const { name, email, password, role } = parsedPayload.data;
    //check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }
    //create user
    const user = await User.create({ name, email, password, role });
    if (!user) {
      throw new ApiError(500, "Failed to create user");
    }
    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user);
    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };
    res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          201,
          {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
          "User registered successfully"
        )
      );
    return;
  }

  async login(req: Request, res: Response) {
    const payload = req.body;
    //validate payload
    const validatedPayload = loginSchema.safeParse(payload);
    if (!validatedPayload.success) {
      throw new ApiError(400, validatedPayload.error.message);
    }
    const { email, password } = validatedPayload.data;
    //find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }
    //check if password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid email or password");
    }
    //generate tokens
    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user);
    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };
    //set cookies and return response
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
          "User logged in successfully"
        )
      );
    return;
  }

  async logout(req: Request, res: Response) {
    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };
    res
      .status(200)
      .cookie("accessToken", "", { ...options, maxAge: 0 })
      .cookie("refreshToken", "", { ...options, maxAge: 0 })
      .json(new ApiResponse(200, null, "User logged out successfully"));
    return;
  }

  async getProfile(req: Request, res: Response) {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }
    res.status(200).json(
      new ApiResponse(
        200,
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        "User profile retrieved successfully"
      )
    );
    return;
  }
}

export default new UserController();
