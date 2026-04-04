import { HydratedDocument, Model } from "mongoose";
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "viewer" | "analyst" | "admin";
  status: "active" | "inactive";
  refreshToken?: string;
}

export interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export type IUserModel = Model<IUser, {}, IUserMethods>;

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
