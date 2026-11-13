# SEATSYNC: COMPLETE PRODUCTION DEPLOYMENT GUIDE (SUPABASE POSTGRESQL + RENDER + VERCEL)

Follow this guide to deploy **SeatSync** to public production infrastructure using **Supabase Managed PostgreSQL**, **Render Web Service** (Backend), and **Vercel** (Frontend).

---

## 1. ARCHITECTURE & SECURITY TOPOLOGY

```
+-----------------------------------------------------------------------+
|                            PUBLIC INTERNET                            |
+-----------------------------------------------------------------------+
                                   |
                  HTTPS Requests   v
            +-----------------------------------------------+
            |          FRONTEND APPLICATION (Vercel)        |
            |       URL: https://seatsync.vercel.app        |
            |    React 18 + TypeScript + Vite + Tailwind    |
            +-----------------------------------------------+
                                   |
                  API Requests     | (Restricted by CORS)
                  Authorization:   v Bearer JWT
            +-----------------------------------------------+
            |           BACKEND REST API (Render)           |
            |       URL: https://seatsync-api.onrender.com   |
            |     Node.js + Express + Prisma ORM + Zod      |
            +-----------------------------------------------+
                                   |
                  PostgreSQL       | Row-Level Concurrency Locks
                  SSL Connection   v (SELECT ... FOR UPDATE)
            +-----------------------------------------------+
            |          SUPABASE POSTGRESQL DATABASE         |
            |      Transaction Pooler: Port 6543 (PgBouncer)|
            |      Direct Migration Link: Port 5432 (TCP)   |
            +-----------------------------------------------+
```

---

## 2. STEP 1: PROVISION SUPABASE POSTGRESQL DATABASE

1. Log in to [Supabase](https://supabase.com) and click **"New Project"**.
2. Set project name: `seatsync-production`.
3. Generate a strong Database Password and store it securely.
4. Select the region closest to your users.
5. In your Supabase Dashboard, navigate to **Project Settings** $\rightarrow$ **Database** $\rightarrow$ **Connection string**:
   - **Transaction Pooler (Port 6543)** - Recommended for runtime queries:
     ```text
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - **Direct Connection (Port 5432)** - Used for running initial migrations:
     ```text
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```

### Database Schema Initialization (Choose Either Method):

* **Option A — Automated via Prisma CLI:**
  ```bash
  cd server
  npx prisma db push
  npm run seed
  ```

* **Option B — Instant 1-Click via Supabase SQL Editor:**
  1. In Supabase Dashboard, click **SQL Editor** $\rightarrow$ **"New query"**.
  2. Open and copy the contents of `server/prisma/migrations/20261113000000_init/migration.sql`.
  3. Paste into the SQL editor and click **Run**.
  4. All 10 tables, 6 enums, unique indexes, and foreign key cascades are created in milliseconds.

---

## 3. STEP 2: DEPLOY BACKEND SERVICE ON RENDER

1. Push your repository to GitHub: `https://github.com/jeevanbgowda235/seatsync`.
2. In [Render Dashboard](https://dashboard.render.com), click **"New +"** $\rightarrow$ **"Web Service"**.
3. Select your repository `jeevanbgowda235/seatsync`.
4. Configure service parameters:
   - **Name:** `seatsync-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npx prisma db push && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start
     ```
5. Configure Environment Variables in Render:

| Variable Name | Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | Your Supabase connection string (Port 6543 or 5432) |
| `DIRECT_URL` | Your Supabase direct connection string (Port 5432) |
| `JWT_SECRET` | Generate via: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `https://seatsync.vercel.app` *(Set to your Vercel frontend domain)* |
| `FRONTEND_URL` | `https://seatsync.vercel.app` |
| `ADMIN_EMAIL` | `admin@seatsync.edu` |
| `ADMIN_INITIAL_PASSWORD` | Strong password of your choice |
| `SEED_DEMO_DATA` | `false` *(Set `false` for production to avoid mock student data)* |

6. Click **"Deploy Web Service"**.
7. Render will output your live API endpoint:
   `https://seatsync-api.onrender.com`
   Verify via browser or curl: `https://seatsync-api.onrender.com/api/health`

---

## 4. STEP 3: DEPLOY FRONTEND ON VERCEL

1. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Import repository `jeevanbgowda235/seatsync`.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://seatsync-api.onrender.com/api`
5. Click **"Deploy"**.
6. Vercel will build and assign your production domain: `https://seatsync.vercel.app`.

---

## 5. STEP 4: PRODUCTION VERIFICATION CHECKLIST

- [x] **Database Provider:** PostgreSQL (Supabase with connection pooling).
- [x] **Schema Integrity:** Native ENUM types (`Role`, `ReservationStatus`, `BorrowStatus`, `LoanStatus`, `SeatType`, `NotificationType`).
- [x] **Concurrency Protection:** Exclusive row locks (`SELECT id FROM "Seat" WHERE id = ... FOR UPDATE`) guarantee zero double-bookings under heavy concurrent reservation traffic.
- [x] **Inventory Protection:** Row-level locking on `Book` table guarantees `availableCopies` never becomes negative.
- [x] **CORS Security:** Restricts incoming requests to only the configured frontend domain; blocks arbitrary origins.
- [x] **Cryptographic JWT:** Production requires 256-bit cryptographically secure keys; no hardcoded defaults.
- [x] **Credential Separation:** Production admin accounts are managed via environment variables and isolated from development demo accounts.
