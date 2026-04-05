import User from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Request } from "../types/auth.types.js";
import { Response } from "express";
import { ApiError } from "../utils/apiError.js";
import { registerSchema } from "../validators/auth.validator.js";
import { createUserSchema } from "../validators/user.validator.js";

class UserController {
  async getAllUsers(req: Request, res: Response) {
    const users = await User.find().select(
      "-password -__v -refreshToken -createdAt -updatedAt"
    );
    if (!users) {
      throw new ApiError(404, "No users found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, users, "Users retrieved successfully"));
    return;
  }

  async getUserById(req: Request, res: Response) {
    const userId = req.params.id;
    const user = await User.findById(userId).select(
      "-password -__v -refreshToken -createdAt -updatedAt"
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, user, "User retrieved successfully"));
    return;
  }

  async createUser(req: Request, res: Response) {
    const payload = req.body;
    const parsedPayload = createUserSchema.safeParse(payload);
    if (!parsedPayload.success) {
      throw new ApiError(400, parsedPayload.error.message);
    }
    const { name, email, password, role, status } = parsedPayload.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }
    const user = await User.create({ name, email, password, role, status });
    if (!user) {
      throw new ApiError(500, "Failed to create user");
    }
    res.status(201).json(
      new ApiResponse(
        201,
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        "User created successfully"
      )
    );
    return;
  }

  async deleteUser(req: Request, res: Response) {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, null, "User deleted successfully"));
    return;
  }
  async updateUser(req: Request, res: Response) {
    const userId = req.params.id;
    const payload = req.body;
    const parsedPayload = createUserSchema.partial().safeParse(payload);
    if (!parsedPayload.success) {
      throw new ApiError(400, parsedPayload.error.message);
    }
    const { name, email, password } = parsedPayload.data;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, null, "User updated successfully"));
    return;
  }
  async changeUserStatus(req: Request, res: Response) {
    const userId = req.params.id;
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.status = status;
    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, null, "User status updated successfully"));
    return;
  }

  async changeUserRole(req: Request, res: Response) {
    const userId = req.params.id;
    const { role } = req.body;
    if (!["viewer", "analyst", "admin"].includes(role)) {
      throw new ApiError(400, "Invalid role value");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.role = role;
    await user.save({ validateBeforeSave: false });

    res
      .status(200)
      .json(new ApiResponse(200, null, "User role updated successfully"));
    return;
  }
}

export default new UserController();
