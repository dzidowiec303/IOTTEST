import AuditLogModel from '../schemas/audit.schema';
import { IAuditLog } from "../models/audit.model";

class AuditService {
    public async log(auditLog: IAuditLog) {
        try {
            const log = new AuditLogModel(auditLog);
            return await log.save();
        } catch (error) {
            console.error('Błąd podczas zapisywania audytu:', error);
            throw new Error('Błąd podczas zapisywania audytu');
        }
    }

    public async getAll(limit: number = 100, skip: number = 0) {
        try {
            const logs = await AuditLogModel.find({})
                .sort({ timestamp: -1 })
                .limit(limit)
                .skip(skip);
            return logs;
        } catch (error) {
            console.error('Błąd podczas pobierania logów:', error);
            throw new Error('Błąd podczas pobierania logów');
        }
    }

    public async getByAction(action: string, limit: number = 100, skip: number = 0) {
        try {
            const logs = await AuditLogModel.find({ action })
                .sort({ timestamp: -1 })
                .limit(limit)
                .skip(skip);
            return logs;
        } catch (error) {
            console.error('Błąd podczas pobierania logów:', error);
            throw new Error('Błąd podczas pobierania logów');
        }
    }

    public async getByUserId(userId: string, limit: number = 100, skip: number = 0) {
        try {
            const logs = await AuditLogModel.find({ 
                $or: [{ userId }, { targetUserId: userId }] 
            })
                .sort({ timestamp: -1 })
                .limit(limit)
                .skip(skip);
            return logs;
        } catch (error) {
            console.error('Błąd podczas pobierania logów:', error);
            throw new Error('Błąd podczas pobierania logów');
        }
    }
}

export default AuditService;
