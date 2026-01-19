import { Schema, model } from 'mongoose';
import { IAuditLog } from "../models/audit.model";

const AuditLogSchema = new Schema<IAuditLog>({
   action: { 
      type: String, 
      enum: ['CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_DATA', 'DELETE_DATA', 'LOGIN', 'LOGOUT'],
      required: true 
   },
   userId: { type: String },
   targetUserId: { type: String },
   targetId: { type: String },
   details: { type: Schema.Types.Mixed, required: true },
   timestamp: { type: Date, default: Date.now },
   ipAddress: { type: String }
});

export default model<IAuditLog>('AuditLog', AuditLogSchema);
