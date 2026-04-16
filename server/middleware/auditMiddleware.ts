// server/middleware/auditMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import User from '../models/User';
import { Types } from 'mongoose';


// Removed duplicate global declaration - use server/types/express.d.ts
// Local AuditRequest type for type safety
interface AuditRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
  requestId?: string;
  auditStartTime?: number;
}

interface AuditLogOptions {
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  status?: 'success' | 'failed' | 'pending';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  skipIfNoUser?: boolean;
  duration?: number;  
  message?: string;
}

// Map URL paths to valid resource enum values
const mapPathToResource = (path: string): string => {
  const segment = path.split('/')[1];
  
  const resourceMap: Record<string, string> = {
    'api': 'unknown',
    'auth': 'user',
    'users': 'user',
    'products': 'product',
    'orders': 'order',
    'reviews': 'review',
    'categories': 'category',
    'company': 'settings',
    'feedback': 'feedback',
    'contact': 'contact',
    'email': 'email',
    'audit': 'settings',
    'health': 'unknown',
    'uploads': 'unknown'
  };
  
  return resourceMap[segment] || 'unknown';
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Get location info from IP (simplified)
const getLocationFromIp = async (ip: string): Promise<{ country?: string; city?: string; timezone?: string }> => {
  return {};
};

// Main audit logging function
export const createAuditLog = async (req: AuditRequest, options: AuditLogOptions) => {
  try {
    const {
      action,
      resource,
      resourceId,
      details,
      severity = 'info',
      status = 'success',
      oldValues,
      newValues,
      skipIfNoUser = false,
      duration
    } = options;

    if (!skipIfNoUser && !req.user) {
      console.warn('Audit log skipped: No authenticated user');
      return null;
    }

    const userAgent = req.get('User-Agent') || 'unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const location = await getLocationFromIp(ipAddress);

    let userEmail = undefined;
    let userName = undefined;
    
    if (req.user) {
      try {
        const user = await User.findById(req.user.userId).select('email name');
        if (user) {
          userEmail = user.email;
          userName = user.name || user.email;
        }
      } catch (err) {
        console.error('Failed to fetch user for audit:', err);
      }
    }

    const validResources = ['user', 'product', 'order', 'review', 'category', 'settings', 'feedback', 'contact', 'email', 'company', 'payment', 'shipping', 'inventory', 'unknown'];
    const validResource = validResources.includes(resource) ? resource : 'unknown';

    const auditLog = new AuditLog({
      action,
      resource: validResource,
      resourceId,
      userId: req.user ? new Types.ObjectId(req.user.userId) : new Types.ObjectId(),
      userEmail,
      userName,
      userRole: req.user?.role,
      userAgent,
      ipAddress,
      location,
      details,
      oldValues,
      newValues,
      status,
      severity,
      duration: duration || (req.auditStartTime ? Date.now() - req.auditStartTime : undefined),
      sessionId: req.session?.id || req.get('x-session-id'),
      requestId: req.requestId,
      createdAt: new Date()
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
};

// ✅ FIX: Properly typed Express middleware
export const auditContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  (req as any).requestId = generateRequestId();
  
  // Set audit start time for duration calculation
  (req as any).auditStartTime = Date.now();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', (req as any).requestId);
  
  next();
};

// ✅ FIX: Properly typed Express middleware factory
export const autoAuditMiddleware = (options?: {
  excludePaths?: string[];
  includeBody?: boolean;
}) => {
  const excludePaths = options?.excludePaths || ['/health', '/metrics', '/static'];
  const includeBody = options?.includeBody || false;

  // Return properly typed Express middleware
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.includes(path))) {
      return next();
    }

    // Skip if no authenticated user
    if (!(req as any).user) {
      return next();
    }

    // Store original send function
    const originalSend = res.json;
    let responseBody: any;

    // Override json method to capture response
    res.json = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    // Determine action based on HTTP method
    let action = 'view';
    switch (req.method) {
      case 'POST':
        action = 'create';
        break;
      case 'PUT':
      case 'PATCH':
        action = 'update';
        break;
      case 'DELETE':
        action = 'delete';
        break;
      case 'GET':
        action = 'view';
        break;
    }

    const resource = mapPathToResource(req.path);
    
    // Extract resource ID from path if exists
    const pathParts = req.path.split('/');
    const resourceId = pathParts[2] && pathParts[2].match(/^[0-9a-fA-F]{24}$/) ? pathParts[2] : undefined;

    // Determine status based on response code
    let status: 'success' | 'failed' | 'pending' = 'pending';
    let severity: 'info' | 'warning' | 'error' | 'critical' = 'info';

    // Listen for response finish
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        status = 'success';
        severity = 'info';
      } else if (res.statusCode >= 400 && res.statusCode < 500) {
        status = 'failed';
        severity = 'warning';
      } else if (res.statusCode >= 500) {
        status = 'failed';
        severity = 'error';
      }

      // Prepare details
      let details = `${req.method} ${req.path} - ${res.statusCode}`;
      let oldValues, newValues;

      if (includeBody && req.body && Object.keys(req.body).length > 0) {
        if (action === 'update') {
          oldValues = req.body;
        } else if (action === 'create') {
          newValues = req.body;
        }
        details += ` - Body: ${JSON.stringify(req.body).substring(0, 200)}`;
      }

      if (responseBody && responseBody.error) {
        details += ` - Error: ${responseBody.error}`;
      }

      // Create audit log
      await createAuditLog(req as any, {
        action,
        resource,
        resourceId,
        details,
        severity,
        status,
        oldValues,
        newValues,
        skipIfNoUser: true
      });
    });

    next();
  };
};

// Manual audit logging decorator
export const auditLog = (options: Omit<AuditLogOptions, 'details'> & { details?: string | ((result: any, req: AuditRequest) => string) }) => {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const req = args.find(arg => arg && arg.user) as AuditRequest;
      const startTime = Date.now();
      
      let result;
      let error: any;
      let status: 'success' | 'failed' = 'success';

      try {
        result = await originalMethod.apply(this, args);
        return result;
      } catch (err) {
        error = err;
        status = 'failed';
        throw err;
      } finally {
        let detailsString = options.details || `${options.action} ${options.resource}`;
        if (typeof options.details === 'function') {
          detailsString = options.details(result, req);
        }

        if (req && req.user) {
          await createAuditLog(req, {
            ...options,
            details: `${detailsString}${error ? ` - Error: ${error.message || 'Unknown error'}` : ''}`,
            status,
            severity: error ? 'error' : (options.severity || 'info'),
            duration: Date.now() - startTime
          });
        }
      }
    };

    return descriptor;
  };
};