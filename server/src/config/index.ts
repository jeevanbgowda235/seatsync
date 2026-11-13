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

// Safely normalize an origin to protocol://host(:port)
export function normalizeOrigin(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    // If it has a protocol scheme that is not http or https, reject it
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
      if (!/^https?:\/\//i.test(trimmed)) {
        return null;
      }
    }
    const target = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(target);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    if (!url.hostname || url.hostname.length === 0) {
      return null;
    }
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

// Parse CORS allowed origins from CORS_ORIGIN, CLIENT_URL, FRONTEND_URL, APP_URL
export function parseAllowedOrigins(): string[] {
  const envSources = [
    process.env.CORS_ORIGIN,
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.APP_URL
  ].filter(Boolean) as string[];

  const originsSet = new Set<string>();

  // 1. Explicitly trusted production deployment origins
  const trustedProductionOrigins = [
    'https://seatsync-2gjspnwlj-zap-j.vercel.app',
    'https://seatsync-vjgetntqa-zap-i.vercel.app',
    'https://seatsync.vercel.app'
  ];

  for (const origin of trustedProductionOrigins) {
    const normalized = normalizeOrigin(origin);
    if (normalized) originsSet.add(normalized);
  }

  // 2. Add origins from environment variables (comma or space separated)
  for (const source of envSources) {
    const parts = source.split(/[,\s]+/);
    for (const part of parts) {
      const normalized = normalizeOrigin(part);
      if (normalized) {
        originsSet.add(normalized);
      }
    }
  }

  // 3. In non-production, include standard local development origins
  if (!isProduction) {
    originsSet.add('http://localhost:3000');
    originsSet.add('http://localhost:5173');
    originsSet.add('http://127.0.0.1:3000');
    originsSet.add('http://127.0.0.1:5173');
  }

  return Array.from(originsSet);
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
