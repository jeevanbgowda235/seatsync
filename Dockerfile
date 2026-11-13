# ====================================================================
# SeatSync Root Dockerfile (For Render deployments configured at root)
# ====================================================================

# --------------------------------------------------------------------
# Stage 1: Build Stage
# --------------------------------------------------------------------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# 1. Install OpenSSL 3.0 and system certificates
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN openssl version

# 2. Copy dependency manifests from server/
COPY server/package*.json ./
COPY server/prisma ./prisma/

RUN rm -rf node_modules/.prisma node_modules/@prisma/client dist
RUN npm ci

# 3. Copy server source code
COPY server/tsconfig.json ./
COPY server/src ./src

# 4. Generate Prisma Client and build
RUN npx prisma generate
RUN npm run build

RUN node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); console.log('✅ Builder: Prisma Engine initialized successfully in Debian Bookworm');"

# --------------------------------------------------------------------
# Stage 2: Production Runtime Stage
# --------------------------------------------------------------------
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN openssl version

COPY server/package*.json ./
RUN rm -rf node_modules/.prisma node_modules/@prisma/client dist
RUN npm ci --omit=dev

COPY server/prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

RUN node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); console.log('✅ Runner: Prisma Runtime verified with native OpenSSL 3.0');"

EXPOSE 5000

# Start production server directly; schema initialization & idempotent seeding are handled safely on boot
CMD ["node", "dist/index.js"]
