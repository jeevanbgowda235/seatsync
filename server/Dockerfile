# ====================================================================
# SeatSync Backend Dockerfile (Debian Bookworm for OpenSSL 3.0 Compatibility)
# ====================================================================

# --- Stage 1: Build Stage ---
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install openssl and certificates required by Prisma Query Engine
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY tsconfig.json ./
COPY src ./src

# Generate Prisma Client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# --- Stage 2: Production Runtime Stage ---
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install native OpenSSL 3.0 runtime libraries
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install production dependencies (includes prisma CLI for db push/seed)
RUN npm install --omit=dev

COPY prisma ./prisma/

# Generate native runtime query engine inside container
RUN npx prisma generate

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]
