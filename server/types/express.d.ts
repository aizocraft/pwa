// server/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        id?: string;
      };
      requestId?: string;
      auditStartTime?: number;
      session?: any;
    }
  }
}
