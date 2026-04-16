// server/types/express.d.ts

export interface AuthUser {
  userId: string;
  role: 'user' | 'sales' | 'admin';
  id?: string;
  email?: string;
}

declare global {
  namespace Express {
    type User = AuthUser;
    
    interface Request {
      user?: AuthUser;
      requestId?: string;
      auditStartTime?: number;
      session?: any;
    }
  }
}

export {};
