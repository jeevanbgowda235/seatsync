import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, normalizeOrigin } from './config';
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

    const incoming = normalizeOrigin(origin);

    // In development mode, allow localhost and local IPs automatically
    if (!config.isProduction) {
      if (
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
    }

    // Exact match against normalized allowed origins
    if (incoming && allowedOrigins.includes(incoming)) {
      return callback(null, true);
    }

    // Permit SeatSync deployments on Vercel over HTTPS
    if (incoming) {
      try {
        const parsed = new URL(incoming);
        if (
          parsed.protocol === 'https:' &&
          parsed.hostname.endsWith('.vercel.app') &&
          parsed.hostname.startsWith('seatsync')
        ) {
          return callback(null, true);
        }
      } catch {}
    }

    console.warn(`[CORS Blocked] Origin: ${origin}. Configured allowed: ${allowedOrigins.join(', ')}`);
    return callback(new Error(`CORS Blocked: Origin ${origin} not permitted by SeatSync security policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'SeatSync Library Management API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Health Check Endpoint with Database Diagnostic (supported on /api/health and /health)
const healthHandler = async (_req: Request, res: Response) => {
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
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Public Library Overview / Stats Summary (accessible by students and patrons)
const publicStatsHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [totalSeats, activeReservations, booksAgg, activeLoans, totalBooks] = await Promise.all([
      prisma.seat.count({ where: { isActive: true } }),
      prisma.reservation.count({
        where: {
          date: todayStr,
          status: { in: ['CONFIRMED', 'CHECKED_IN'] }
        }
      }),
      prisma.book.aggregate({
        _sum: {
          totalCopies: true,
          availableCopies: true
        }
      }),
      prisma.borrowingRecord.count({
        where: { status: 'BORROWED' }
      }),
      prisma.book.count()
    ]);

    const occupiedSeats = activeReservations;
    const availableSeats = Math.max(0, totalSeats - occupiedSeats);
    const occupancyRate = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalSeats,
        occupiedSeats,
        availableSeats,
        seatOccupancyRate: occupancyRate,
        totalBooks,
        totalCopies: booksAgg._sum.totalCopies || totalBooks,
        availableCopies: booksAgg._sum.availableCopies || totalBooks,
        activeLoans
      }
    });
  } catch (err: any) {
    console.error('Error fetching public stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch library stats' });
  }
};

app.get('/api/stats/summary', publicStatsHandler);
app.get('/stats/summary', publicStatsHandler);

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

// Mount API Routes (Support both /api/* and direct /* prefixes for seamless proxy/direct compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/seats', seatRoutes);
app.use('/seats', seatRoutes);

app.use('/api/reservations', reservationRoutes);
app.use('/reservations', reservationRoutes);

app.use('/api/books', bookRoutes);
app.use('/books', bookRoutes);

app.use('/api/borrow', borrowRoutes);
app.use('/borrow', borrowRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

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

// Automatic Database Bootstrap on Startup (Idempotent & Safe)
async function bootstrapDatabase() {
  try {
    // If DIRECT_URL is not set but DATABASE_URL uses Supabase pooler (port 6543),
    // derive the direct session port (5432) so Prisma CLI commands don't fail against PgBouncer.
    if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
      if (process.env.DATABASE_URL.includes(':6543')) {
        process.env.DIRECT_URL = process.env.DATABASE_URL
          .replace(':6543', ':5432')
          .replace('?pgbouncer=true', '')
          .replace('&pgbouncer=true', '');
        console.log('ℹ️ Auto-configured DIRECT_URL on port 5432 for Prisma migration compatibility.');
      }
    }

    console.log('📡 Verifying database connection...');
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully.');

    // 1. Check if database tables already exist
    let tablesExist = false;
    try {
      await prisma.user.findFirst();
      tablesExist = true;
      console.log('✅ Schema tables verified. Skipping schema push.');
    } catch (tblErr: any) {
      if (
        tblErr.code === 'P2021' ||
        tblErr.message?.includes('does not exist') ||
        tblErr.message?.includes('relation')
      ) {
        tablesExist = false;
        console.log('⚠️ PostgreSQL tables missing! Executing one-time automated schema push...');
      } else {
        throw tblErr;
      }
    }

    // Only run schema push if tables are missing
    if (!tablesExist) {
      const { execSync } = await import('child_process');
      try {
        execSync('npx prisma db push --skip-generate --accept-data-loss', {
          stdio: 'inherit',
          env: process.env
        });
        console.log('✅ Database tables created via prisma db push.');
      } catch (pushErr: any) {
        console.warn('⚠️ Automated prisma db push encountered a non-fatal warning:', pushErr.message);
      }
    }

    // 2. Ensure initial demo accounts exist idempotently
    try {
      const demoStudent = await prisma.user.findUnique({
        where: { email: 'alex.morgan@university.edu' }
      });

      if (!demoStudent) {
        console.log('🌱 Demo student missing. Initializing demo accounts and inventory...');
        const { runSeed } = await import('./prisma/seed');
        await runSeed();
      } else {
        console.log('✅ Production data verified. Seeding skipped to preserve existing records.');
      }
    } catch (seedErr: any) {
      console.warn('⚠️ Seed check non-fatal warning:', seedErr.message);
    }
  } catch (err: any) {
    console.error('❌ Database connection error on startup:', err.message);
    console.warn('⚠️ Server running in degraded mode. Verify DATABASE_URL in Render dashboard.');
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
