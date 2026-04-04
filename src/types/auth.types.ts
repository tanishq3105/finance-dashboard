import { Request as ExpressRequest } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface Request extends ExpressRequest {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: "viewer" | "analyst" | "admin";
    status: string;
  };
}
