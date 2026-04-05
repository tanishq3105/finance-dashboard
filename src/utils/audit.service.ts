import mongoose from "mongoose";
import AuditLog from "../models/auditLog.model.js";

export const log = async (
  userId: string,
  action: string,
  entity: string,
  entityId?: string | number
): Promise<void> => {
  try {
    let eventEntityId: mongoose.Types.ObjectId | null = null;

    if (entityId) {
      try {
        eventEntityId = new mongoose.Types.ObjectId(String(entityId));
      } catch {
        // Invalid ObjectId format, skip
        eventEntityId = null;
      }
    }

    await AuditLog.create({
      user_id: userId,
      action,
      entity,
      entity_id: eventEntityId,
    });
  } catch (error) {
    console.error(
      "Audit log error:",
      error instanceof Error ? error.message : error
    );
  }
};
