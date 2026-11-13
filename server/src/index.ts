import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
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

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SeatSync Library Management API',
    environment: config.nodeEnv,
    databaseProvider: 'PostgreSQL',
    version: '1.0.0'
  });
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

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 SeatSync Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Allowed CORS Origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'Strict Local Only'}`);
});

export default app;
