export interface IAuditLog {
   _id?: string;
   action: 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER' | 'CREATE_DATA' | 'DELETE_DATA' | 'LOGIN' | 'LOGOUT';
   userId?: string;
   targetUserId?: string;
   targetId?: string;
   details: Record<string, any>;
   timestamp: Date;
   ipAddress?: string;
}
