import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import prisma from './prisma/client';
import authRoutes from './routes/auth';
import seatRoutes from './routes/seats';
import reservationRoutes from './routes/reservations';
import bookRoutes from './routes/books';
import borrowRoutes from './routes/borrow';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';

const app = express();

// Security headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Production-hardened CORS configuration
const allowedOrigins = config.corsOrigins;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server health checks)
    if (!origin) {
      return callback(null, true);
    }

    // In development mode, allow localhost and local IPs automatically
    if (!config.isProduction) {
      if (
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
    }

    // Allow configured production frontend origins or wildcard if explicitly specified
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Check wildcard subdomains (e.g. *.vercel.app)
    const isMatched = allowedOrigins.some(pattern => {
      if (pattern.startsWith('*.')) {
        const base = pattern.slice(2);
        try {
          const url = new URL(origin);
          return url.hostname.endsWith(base);
        } catch {
          return false;
        }
      }
      return false;
    });

    if (isMatched) {
      return callback(null, true);
    }

    console.warn(`[CORS Blocked] Origin: ${origin}. Configured allowed: ${allowedOrigins.join(', ')}`);
    return callback(new Error(`CORS Blocked: Origin ${origin} not permitted by SeatSync security policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint with Database Diagnostic
app.get('/api/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  let userCount = 0;
  let seatCount = 0;
  let errorMsg = null;

  try {
    userCount = await prisma.user.count();
    seatCount = await prisma.seat.count();
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = 'error';
    errorMsg = err.message;
  }

  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'SeatSync Library Management API',
    environment: config.nodeEnv,
    databaseProvider: 'PostgreSQL',
    database: {
      status: dbStatus,
      userCount,
      seatCount,
      error: errorMsg
    },
    version: '1.0.0'
  });
});

// Explicit Database Setup / Synchronization Route
app.post('/api/admin/bootstrap-db', async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Manual DB bootstrap requested...');
    const { execSync } = await import('child_process');
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', {
        stdio: 'inherit',
        env: process.env
      });
    } catch (e: any) {
      console.warn('db push warning:', e.message);
    }
    const { runSeed } = await import('./prisma/seed');
    await runSeed();
    const userCount = await prisma.user.count();
    const seatCount = await prisma.seat.count();
    res.json({
      success: true,
      message: 'Database schema and seed initialized successfully!',
      userCount,
      seatCount
    });
  } catch (err: any) {
    console.error('Bootstrap error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.message && err.message.includes('CORS')) {
    res.status(403).json({
      success: false,
      message: err.message
    });
    return;
  }
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Automatic Database Bootstrap on Startup
async function bootstrapDatabase() {
  try {
    console.log('📡 Verifying database connection...');
    await prisma.$connect();
    console.log('✅ PostgreSQL connected.');

    // 1. Verify if tables exist
    try {
      await prisma.user.findFirst();
      console.log('✅ Schema tables verified.');
    } catch (tblErr: any) {
      if (tblErr.code === 'P2021' || tblErr.message?.includes('does not exist') || tblErr.message?.includes('relation')) {
        console.log('⚠️ PostgreSQL tables missing! Executing automated schema push...');
        const { execSync } = await import('child_process');
        execSync('npx prisma db push --skip-generate --accept-data-loss', {
          stdio: 'inherit',
          env: process.env
        });
        console.log('✅ Database tables created via prisma db push.');
      }
    }

    // 2. Ensure initial seed accounts exist
    const { runSeed } = await import('./prisma/seed');
    await runSeed();
  } catch (err: any) {
    console.error('❌ Database bootstrap error:', err.message);
  }
}

const PORT = config.port;
app.listen(PORT, async () => {
  console.log(`🚀 SeatSync Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Allowed CORS Origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'Strict Local Only'}`);
  await bootstrapDatabase();
});

export default app;
