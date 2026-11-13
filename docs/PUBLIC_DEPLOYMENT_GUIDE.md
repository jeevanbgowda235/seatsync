# SEATSYNC: COMPLETE PUBLIC DEPLOYMENT & PRODUCTION HOSTING GUIDE

Follow this guide to make **SeatSync** accessible to you, your professors, and your friends from different laptops, mobile smartphones, and internet connections anywhere in the world.

---

## ARCHITECTURE OVERVIEW

```
+-------------------------------------------------------------+
|                        PUBLIC INTERNET                      |
+-------------------------------------------------------------+
                              |
                              v
        +---------------------------------------------+
        |             FRONTEND HOST (Vercel)          |
        |  URL: https://seatsync.vercel.app          |
        |  Tech: React + TypeScript + Vite + Tailwind |
        +---------------------------------------------+
                              |
                              | API Requests
                              v
        +---------------------------------------------+
        |            BACKEND HOST (Render)            |
        |  URL: https://seatsync-api.onrender.com     |
        |  Tech: Node.js + Express + Prisma ORM       |
        +---------------------------------------------+
                              |
                              | SSL Connection
                              v
        +---------------------------------------------+
        |          MANAGED POSTGRESQL DATABASE        |
        |    Provider: Supabase / Render / Neon       |
        |    Host: ep-xxxx.us-east-2.aws.neon.tech    |
        +---------------------------------------------+
```

---

## STEP 1: DEPLOY FREE POSTGRESQL DATABASE (Supabase or Neon)

### Option A: Using Supabase (Recommended)
1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"** (Free tier).
2. Create a new project named `seatsync-db`.
3. Set a strong database password (e.g. `SeatSyncPostgres2026!`).
4. Select the region closest to you.
5. In **Project Settings** $\rightarrow$ **Database**, find the **Connection String** (URI mode):
   ```text
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```
6. Copy this string for Step 2.

### Option B: Using Neon
1. Go to [https://neon.tech](https://neon.tech) and create a free project.
2. Copy the PostgreSQL connection URI provided on the dashboard.

---

## STEP 2: DEPLOY BACKEND ON RENDER

1. Push your repository to **GitHub** (or create a private GitHub repository):
   ```bash
   git init
   git add .
   git commit -m "feat: complete SeatSync production full-stack release"
   git remote add origin https://github.com/YOUR_USERNAME/seatsync.git
   git push -u origin main
   ```
2. Log in to [https://render.com](https://render.com).
3. Click **"New +"** $\rightarrow$ **"Web Service"**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name:** `seatsync-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Region:** Any close region (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npx prisma db push && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start
     ```
   - **Plan:** Free
6. Add **Environment Variables** in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: `seatsync-super-secret-jwt-key-2026-prod`
   - `JWT_EXPIRES_IN`: `7d`
   - `CORS_ORIGIN`: `*`
   - `DATABASE_URL`: `[PASTE_YOUR_SUPABASE_OR_NEON_POSTGRES_CONNECTION_STRING_HERE]`
7. Click **"Create Web Service"**.
8. Render will build the TypeScript backend, connect to PostgreSQL, apply the schema, and start the API!
9. Once deployed, Render will display your public API URL:
   `https://seatsync-api.onrender.com`

### Initialize Database Seed Data:
To populate the 40 seats, 8 rich book titles, and demo accounts, run the seed script directly from the Render Shell tab:
```bash
npm run seed
```

---

## STEP 3: DEPLOY FRONTEND ON VERCEL

1. Log in to [https://vercel.com](https://vercel.com).
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Import your GitHub repository.
4. In the configuration screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click "Edit" and choose `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add **Environment Variable**:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://seatsync-api.onrender.com/api` (use your actual Render backend URL)
6. Click **"Deploy"**.
7. In ~30 seconds, Vercel will give you a public production URL:
   `https://seatsync.vercel.app` (or your custom domain)

---

## STEP 4: VERIFY PUBLIC ACCESS FOR FRIENDS

Share your public Vercel link (`https://seatsync.vercel.app`) with your friends.

They can open it on:
- Windows laptops
- MacBooks / iPads
- Android smartphones / iPhones
- Chrome, Safari, Edge, or Firefox

### Demo Accounts for Testing:
- **Demo Student:**
  - Email: `alex.morgan@university.edu`
  - Password: `StudentPass123!`
  - Features: Reserve reading desk, view real-time green/red seat map, request book borrowing, access QR pass.
- **Demo Administrator:**
  - Email: `admin@seatsync.edu`
  - Password: `AdminPassword123!`
  - Features: Recharts analytics dashboard, review and approve borrow requests, check in students, manage seats and books.
- **Self-Registration:**
  - Anyone can click **"Get Started"** or **"Register"** to create a student account with their own name and student ID.
