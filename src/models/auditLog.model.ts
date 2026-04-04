
import mongoose from "mongoose";
const auditLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    action: {
        type: String,
        required: [true, "Action is required"],
        trim: true,
    },
    entity: {
        type: String,
        trim: true,
    },
    entity_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;