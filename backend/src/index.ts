import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envFileLocal = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: fs.existsSync(envFileLocal) ? envFileLocal : path.resolve(__dirname, '../.env') });
import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import morganMiddleware from './config/morganConfig';
import CacheMiddleware from './middleware/cacheMiddleware';
// Import modules from new modular structure
import * as authModule from './modules/auth';
import * as userProfileModule from './modules/user-profile';
import * as materialModule from './modules/material';
import * as imageModule from './modules/image';
import * as wastePostModule from './modules/waste-post';
import * as collectionModule from './modules/collection';
import * as messageModule from './modules/message';
import * as conversationModule from './modules/conversation';
import * as notificationModule from './modules/notification';
import * as postMessageModule from './modules/post-message';
import * as reviewModule from './modules/review';
import * as feedbackModule from './modules/feedback';
import * as reportModule from './modules/report';
import * as ratingModule from './modules/rating';
import { checkRedisConnection } from './config/redisHealth';
import { initializeSocket } from './services/socketService';
import { validateAwsConfig } from './config/aws';
import { initializePickupDeadlineChecker } from './services/pickupDeadlineService';
import { sequelize } from './models';
import CacheService from './services/cacheService';

const logger = process.env.NODE_ENV === 'production'
  ? require('./config/logger.prod').default
  : require('./config/logger.dev').default;

const validateEnvironment = (): void => {
  const requiredVars = ['JWT_SECRET'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET || '';

  validateAwsConfig();
  logger.info('Environment validation passed');
};

validateEnvironment();

const app: Express = express();
const server = createServer(app); 
const PORT = process.env.PORT || 5000;

logger.info(`🚀 Starting Scrapair Backend Server...`);
logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`🔧 Port: ${PORT}`);

app.set('trust proxy', 1);

// Add compression middleware early in the chain
app.use(compression({
  level: 6, // Balance between compression speed and ratio
  threshold: 1024, // Only compress response > 1KB
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Parse request bodies EARLY - before any other middleware that might intercept
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// CORS configuration - use function for safer origin handling
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin: string) => origin.trim());

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (same-origin requests, like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

app.use(helmet({
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'ws:', 'wss:'], // Allow WebSocket connections
      mediaSrc: ["'self'"],
      fontSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: false
  }
}));

app.use(morganMiddleware);
logger.info('📝 HTTP request logging enabled');

// Global rate limiter (stricter for production)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.path === '/api/health' || req.path === '/health';
  }
});
app.use('/api/', globalLimiter);

// Cache and response header middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    // Cache GET requests in browser for 1 hour
    res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    res.set('Pragma', 'public');
  } else {
    // Don't cache mutations
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Response payload size limiter - FIXED to prevent infinite recursion
app.use((req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);
  let isCheckingSize = false;

  res.json = function(data: any) {
    // Skip size check if we're already in a size limit error response (prevent recursion)
    if (isCheckingSize || !data) {
      return originalJson.call(this, data);
    }

    isCheckingSize = true;
    try {
      const size = Buffer.byteLength(JSON.stringify(data), 'utf8');
      res.set('X-Response-Size', size.toString());
      
      // Enforce 1MB max response size
      if (size > 1048576) { // 1MB
        isCheckingSize = false; // Reset before sending error response
        res.status(413);
        return originalJson.call(this, {
          error: 'Payload too large',
          message: `Response size ${size} bytes exceeds limit of 1MB`,
          size,
          limit: 1048576
        });
      }
    } finally {
      isCheckingSize = false;
    }

    return originalJson.call(this, data);
  };

  next();
});

const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      
      if (corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Socket.IO denied CORS request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket'], // WebSocket only - disable polling to reduce HTTP load
  maxHttpBufferSize: 1e6,
  pingInterval: 30000, // Optimized ping interval
  pingTimeout: 15000,
  allowRequest: (req, callback) => {
    // Allow all requests - CORS is handled above
    callback(null, true);
  }
});

// Socket.IO Error Handlers - CRITICAL for production
io.on('error', (error: any) => {
  logger.error('Socket.IO server error:', error);
});

io.on('connect_error', (error: any) => {
  logger.error('Socket.IO connection error:', error.message);
});

io.engine.on('connection_error', (error: any) => {
  logger.error('Socket.IO engine connection error:', error.message);
});

logger.info('🔌 Socket.io server initialized with error handlers');

app.use((req: any, res, next) => {
  req.io = io;
  next();
});

initializeSocket(io);
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true
  }
}));

app.use('/api/auth', authModule.router);
app.use('/api/users', userProfileModule.router);
app.use('/api/materials', materialModule.router);
app.use('/api/waste-posts', wastePostModule.router);
app.use('/api/collections', collectionModule.router);
app.use('/api/messages', messageModule.router);
app.use('/api/conversations', conversationModule.router);
app.use('/api/notifications', notificationModule.router);
app.use('/api/images', imageModule.router);
app.use('/api/post-messages', postMessageModule.router);
app.use('/api/reviews', reviewModule.router);
app.use('/api/feedback', feedbackModule.router);
app.use('/api/reports', reportModule.router);
app.use('/api/ratings', ratingModule.router);
const serverStartTime = new Date();

app.get('/api/health', (req: Request, res: Response) => {
  const uptime = new Date().getTime() - serverStartTime.getTime();
  const uptimeSeconds = Math.floor(uptime / 1000);
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const uptimeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const imageUploadEnabled = !!(
    process.env.SUPABASE_URL && 
    process.env.SUPABASE_ANON_KEY && 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get cache statistics
  const cacheStats = CacheService.getCacheStats();

  res.status(200).json({
    status: 'OK',
    server: 'Scrapair Backend API',
    environment: process.env.NODE_ENV || 'development',
    uptime: uptimeFormatted,
    timestamp: new Date().toISOString(),
    cache: {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRatio: cacheStats.hitRatio + '%'
    },
    features: {
      phase1: 'Waste Posting ',
      phase2: 'Collection ',
      phase3: 'Messaging & Notifications ',
      imageUpload: imageUploadEnabled ? ' Supabase Storage Enabled' : '  Supabase Storage Disabled (configure credentials)'
    },
    version: '1.0.0'
  });
});
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.path} - Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

async function startServer() {
  let redisConnected = false;
  
  try {
    try {
      logger.info('🔍 Checking Redis connection...');
      await checkRedisConnection();
      redisConnected = true;
      logger.info('✅ Redis connected successfully');
    } catch (redisError: any) {
      logger.warn(`⚠️  Redis connection failed: ${redisError.message}`);
    }

    logger.info('🔍 Connecting to database...');
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');

    server.listen(PORT, () => {
      const baseUrl = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;
      logger.info(`✨ Server running at ${baseUrl}`);
      logger.info(`📚 API Docs available at ${baseUrl}/api-docs`);
      
      try {
        initializePickupDeadlineChecker();
        logger.info('⏰ Pickup deadline checker initialized');
      } catch (err: any) {
        logger.error(`Failed to initialize pickup deadline checker: ${err.message}`);
      }
    });
  } catch (error: any) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown handlers - CRITICAL for production
// Register IMMEDIATELY before any async operations to ensure they're always active
let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    logger.warn(`⚠️  ${signal} received again, forcing shutdown`);
    process.exit(1);
  }
  isShuttingDown = true;
  
  logger.info(`\n📍 Received ${signal}, starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close((err?: Error) => {
    if (err) {
      logger.error('Error during server.close():', err.message);
    }
    logger.info('✅ HTTP server closed');
    
    try {
      // Close Socket.IO connections gracefully
      io.close();
      logger.info('✅ Socket.IO closed');
    } catch (closeErr: any) {
      logger.error('Error closing Socket.IO:', closeErr?.message);
    }

    // Close database connection (async but don't wait - timeout will handle)
    sequelize.close().catch((err: any) => {
      logger.error('Error closing database:', err?.message);
    }).then(() => {
      logger.info('✅ Database connection closed');
      logger.info('🛑 Server shutdown complete');
      process.exit(0);
    });
  });

  // Force shutdown after 30 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.warn('⚠️  Graceful shutdown timeout, forcing exit');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
