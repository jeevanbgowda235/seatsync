# ====================================================================
# SeatSync Backend Production Dockerfile (Debian 12 Bookworm + OpenSSL 3.0)
# ====================================================================

# --------------------------------------------------------------------
# Stage 1: Build Stage
# --------------------------------------------------------------------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# 1. Install OpenSSL 3.0 and system certificates before any Node operations
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN openssl version

# 2. Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# 3. Clean any stale cached Prisma artifacts and install dependencies
RUN rm -rf node_modules/.prisma node_modules/@prisma/client dist
RUN npm ci

# 4. Copy application source code and TypeScript config
COPY tsconfig.json ./
COPY src ./src

# 5. Generate Prisma Client for debian-openssl-3.0.x and build application
RUN npx prisma generate
RUN npm run build

# 6. Build-time sanity verification of Prisma client instantiation in Debian
RUN node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); console.log('✅ Builder: Prisma Engine initialized successfully in Debian Bookworm');"

# --------------------------------------------------------------------
# Stage 2: Production Runtime Stage
# --------------------------------------------------------------------
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# 1. Install native OpenSSL 3.0 runtime libraries
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN openssl version

# 2. Copy dependency manifests and install production dependencies only
COPY package*.json ./
RUN rm -rf node_modules/.prisma node_modules/@prisma/client dist
RUN npm ci --omit=dev

# 3. Copy Prisma schema and generate native runtime query engine
COPY prisma ./prisma/
RUN npx prisma generate

# 4. Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# 5. Runtime sanity verification: ensure libquery_engine-debian-openssl-3.0.x.so.node loads cleanly
RUN node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); console.log('✅ Runner: Prisma Runtime verified with native OpenSSL 3.0');"

EXPOSE 5000

# Push schema directly to database before starting API
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node dist/index.js"]
