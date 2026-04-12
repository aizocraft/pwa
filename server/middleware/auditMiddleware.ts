// server/middleware/auditMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import { Types } from 'mongoose';

interface AuditRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
  requestId?: string;
  auditStartTime?: number;
  session?: {
    id: string;
    [key: string]: any;
  };
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

// ✅ ADD THIS FUNCTION - Maps URL paths to valid resource enum values
const mapPathToResource = (path: string): string => {
  // Remove leading slash and get first segment
  const segment = path.split('/')[1];
  
  // Map common paths to valid enum values from your AuditLog model
  const resourceMap: Record<string, string> = {
    'api': 'unknown',     // Default for /api routes
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

// Get location info from IP (simplified - you might want to use a geolocation service)
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

    // If skipIfNoUser is false and no user exists, skip logging
    if (!skipIfNoUser && !req.user) {
      console.warn('Audit log skipped: No authenticated user');
      return null;
    }

    // Get user agent and IP
    const userAgent = req.get('user-agent') || 'unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Get location from IP (optional - can be async)
    const location = await getLocationFromIp(ipAddress);

    // Prepare user info
    let userEmail = undefined;
    let userName = undefined;
    
    if (req.user) {
      try {
        const user = await (await import('../models/User')).default.findById(req.user.userId);
        if (user) {
          userEmail = user.email;
          userName = user.name || user.email;
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }

    // ✅ VALIDATE RESOURCE - Ensure it's in the enum
    const validResources = ['user', 'product', 'order', 'review', 'category', 'settings', 'feedback', 'contact', 'email', 'company', 'payment', 'shipping', 'inventory', 'unknown'];
    const validResource = validResources.includes(resource) ? resource : 'unknown';

    const auditLog = new AuditLog({
      action,
      resource: validResource,  // Use validated resource
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

// Middleware to initialize audit context
export const auditContextMiddleware = (req: AuditRequest, res: Response, next: NextFunction) => {
  // Generate unique request ID
  req.requestId = generateRequestId();
  
  // Set audit start time for duration calculation
  req.auditStartTime = Date.now();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
};

// Middleware to automatically log API requests
export const autoAuditMiddleware = (options?: {
  excludePaths?: string[];
  includeBody?: boolean;
}) => {
  const excludePaths = options?.excludePaths || ['/health', '/metrics', '/static'];
  const includeBody = options?.includeBody || false;

  return async (req: AuditRequest, res: Response, next: NextFunction) => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.includes(path))) {
      return next();
    }

    // ✅ Skip if no authenticated user to avoid logging unauthenticated requests
    if (!req.user) {
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

    // ✅ USE THE MAPPING FUNCTION instead of direct path extraction
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

      // Create audit log - skipIfNoUser is true because we already checked above
      await createAuditLog(req, {
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

// Manual audit logging decorator for specific functions
export const auditLog = (options: Omit<AuditLogOptions, 'details'> & { details?: string | ((result: any, req: Request) => string) }) => {
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
        // Generate details string
        let detailsString = options.details || `${options.action} ${options.resource}`;
        if (typeof options.details === 'function') {
          detailsString = options.details(result, req);
        }

        // Log the audit
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