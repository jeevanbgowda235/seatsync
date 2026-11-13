import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Secure JWT Secret handling
function resolveJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  const placeholderSecrets = [
    'seatsync-super-secret-jwt-key-2026',
    'your-production-jwt-secret-replace-in-cloud',
    'change-me',
    'seatsync-dev-secret-do-not-use-in-production-change-me'
  ];

  if (isProduction) {
    if (!envSecret || placeholderSecrets.includes(envSecret)) {
      const generated = crypto.randomBytes(32).toString('hex');
      console.warn('⚠️ [SECURITY WARNING] No secure JWT_SECRET environment variable detected in production!');
      console.warn('⚠️ An ephemeral 256-bit cryptographic key has been generated for this instance.');
      console.warn('⚠️ To ensure token persistence across restarts, set a dedicated JWT_SECRET in your production dashboard.');
      return generated;
    }
    return envSecret;
  }

  return envSecret || 'seatsync-development-jwt-secret-key-local-only';
}

// Parse CORS allowed origins from CORS_ORIGIN and FRONTEND_URL
function parseAllowedOrigins(): string[] {
  const rawOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL
  ].filter(Boolean).join(',');

  if (!rawOrigins || rawOrigins.trim() === '') {
    return isProduction ? [] : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];
  }

  return rawOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: parseAllowedOrigins(),
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  adminInitialEmail: process.env.ADMIN_EMAIL || 'admin@seatsync.edu',
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD,
  seedDemoData: process.env.SEED_DEMO_DATA === 'true' || !isProduction,
  libraryConfig: {
    openingHour: 8, // 08:00 AM
    closingHour: 22, // 10:00 PM
    defaultLoanDays: 14,
    finePerDay: 2.0, // $2.00 or local currency equivalent
    maxBorrowLimit: 3
  }
};
