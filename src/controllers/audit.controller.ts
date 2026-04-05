import AuditLog from "../models/auditLog.model.js";
import { Response } from "express";
import { Request } from "../types/auth.types.js";
import { ApiResponse } from "../utils/apiResponse.js";
class AuditController {
  async getAuditLogs(req: Request, res: Response) {
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res
      .status(200)
      .json(new ApiResponse(200, logs, "Audit logs retrieved successfully"));
  }

  async getLogbyUser(req: Request, res: Response) {
    const userId = req.params.userId;
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const logs = await AuditLog.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res
      .status(200)
      .json(new ApiResponse(200, logs, "Audit logs retrieved successfully"));
  }
}

export default new AuditController();
