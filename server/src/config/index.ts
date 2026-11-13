import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'seatsync-super-secret-jwt-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || '',
  libraryConfig: {
    openingHour: 8, // 08:00 AM
    closingHour: 22, // 10:00 PM
    defaultLoanDays: 14,
    finePerDay: 2.0, // $2.00 or local currency equivalent
    maxBorrowLimit: 3
  }
};
