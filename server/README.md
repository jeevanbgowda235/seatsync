# SeatSync — Library Seat Reservation & Book Borrowing Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20.18-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-17%2F17%20Passed-success.svg)](./docs/TESTING_AND_QA_REPORT.md)

> **"Your Space. Your Books. Your Focus."**

SeatSync is a modern, enterprise-grade full-stack web application designed for academic libraries. It provides students with real-time library seat reservations, digital book catalogue browsing, online borrowing requests, and encrypted QR-code check-ins. It also provides library administrators with analytics dashboards, spatial seat matrix management, catalog maintenance, and circulation controls.

---

## 🌟 CORE FEATURES

### 1. Interactive Library Floor Plan & Seat Reservation
- Multi-floor visual matrix (Floor 1: Quiet & Collaborative Zones; Floor 2: Dual-Monitor Tech Lab & Silent Booths).
- Unique seat identifiers (A01–A06, B01–B06, E01–E06, G01–G04).
- Real-time color status indicators:
  - 🟢 **Green:** Available for reservation.
  - 🔴 **Red:** Occupied or reserved for the chosen time window.
  - 🔵 **Blue:** Selected by current user.
  - ⚪ **Grey:** Under maintenance or decommissioned.
- **Double Booking Prevention:** ACID database transactions enforce non-overlapping time slot validation (`start1 < end2 && end1 > start2`).

### 2. Encrypted QR Code Check-In
- Instant digital pass generated with embedded reservation metadata and QR code.
- Kiosk/mobile scanner validation to prevent ghost bookings and automated no-show cancellations.

### 3. Digital Book Catalogue & Circulation System
- Search books by title, author name, or ISBN.
- Filter by academic disciplines (Computer Science, Software Engineering, AI, Mathematics, Cybersecurity, Business).
- Real-time shelf inventory tracking with zero negative count bounds.
- Borrowing workflow: Student requests $\rightarrow$ Admin reviews (approves with custom loan duration or declines with reason) $\rightarrow$ inventory updates $\rightarrow$ return logging with automated late fine calculation ($2.00/day).

### 4. Executive Admin Analytics Hub
- 8 KPI cards: Total Students, Total Seats, Seat Occupancy %, Total Volumes, Available Copies, Active Loans, Pending Requests, Overdue Loans.
- 4 interactive Recharts visualizations:
  - Daily Seat Utilization Trend (AreaChart)
  - Most Borrowed Academic Volumes (BarChart)
  - Category Collection Distribution (PieChart)
  - Monthly Circulation Velocity (BarChart)
- Full administrative management for Seats, Reservations, Books, Borrowings, and Student Patrons.

---

## 🏗️ ARCHITECTURE & TECH STACK

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, React Router DOM, Lucide React, Recharts, Canvas-Confetti.
- **Backend:** Node.js, Express.js, TypeScript, RESTful API architecture.
- **Database & ORM:** PostgreSQL, Prisma ORM.
- **Authentication & Security:** Bcrypt password hashing (10 salt rounds), JSON Web Tokens (JWT), Role-Based Access Control (RBAC), Helmet security headers, CORS origin protection, Zod schema validation.
- **Deployment Targets:**
  - Frontend: Vercel CDN
  - Backend: Render / Railway / Docker
  - Database: Supabase / Neon / Render PostgreSQL

---

## 📁 REPOSITORY STRUCTURE

```
Software Event/
├── client/                     # React + TypeScript Frontend
│   ├── src/
│   │   ├── api/                # Axios API client with auth interceptor
│   │   ├── components/         # Navbar, Footer, SeatMap, StatsCard, ProtectedRoute
│   │   ├── context/            # AuthContext (state, login, register, demo toggles)
│   │   ├── pages/              # Landing, Student & Admin dashboards, Catalogue, etc.
│   │   ├── types/              # Domain models and interfaces
│   │   ├── App.tsx             # Route configuration
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # Environment & library operational rules
│   │   ├── middleware/         # JWT authentication & requireAdmin guards
│   │   ├── prisma/             # Client singleton & complete seed script
│   │   ├── routes/             # Auth, Seats, Reservations, Books, Borrow, Admin, Notifications
│   │   ├── tests/              # Automated unit and algorithm test runner
│   │   └── index.ts            # Express server entry point
│   ├── prisma/
│   │   └── schema.prisma       # Complete PostgreSQL schema
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── package.json
├── docs/                       # Academic Software Engineering Documentation
│   ├── SOFTWARE_ENGINEERING_DOCUMENTATION.md   # Complete Unit 1 & Unit 2 report
│   ├── TESTING_AND_QA_REPORT.md               # 17-point test execution log
│   └── PUBLIC_DEPLOYMENT_GUIDE.md             # Public hosting step-by-step
├── render.yaml                 # Infrastructure as Code for Render
└── README.md
```

---

## 🚀 LOCAL SETUP INSTRUCTIONS

### Prerequisites
- Node.js $\ge$ 20.x
- npm $\ge$ 10.x

### 1. Backend Setup
```bash
cd server
npm install
npx prisma generate
```

Configure `server/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=seatsync-super-secret-jwt-key-2026
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/seatsync?schema=public"
```

Push schema & seed demo data:
```bash
npx prisma db push
npm run seed
```

Start backend development server:
```bash
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
# Running on http://localhost:3000
```

---

## 🧪 RUNNING VERIFICATION TESTS

To run the automated algorithm, concurrency, cryptographic, and data validation test suite:
```bash
cd server
npx ts-node src/tests/unit-tests.ts
```

All 17 tests verify:
- Partial, enclosed, and superset time slot overlap detection.
- Bcrypt salt hashing and invalid credential rejection.
- JWT signature protection and role enforcement.
- Zod schema sanitization.
- Overdue late fee calculation formulas.

---

## 🌐 PUBLIC DEPLOYMENT (FOR FRIENDS TO ACCESS)

See [docs/PUBLIC_DEPLOYMENT_GUIDE.md](./docs/PUBLIC_DEPLOYMENT_GUIDE.md) for full instructions:
1. **Database:** Deploy free PostgreSQL on **Supabase** or **Neon**.
2. **Backend:** Deploy `server/` on **Render** (Free tier). Add `DATABASE_URL` environment variable.
3. **Frontend:** Deploy `client/` on **Vercel** (Free tier). Add `VITE_API_BASE_URL` pointing to your Render backend.
4. **Share the Vercel URL:** Anyone with a browser can access the live application from any laptop or phone worldwide!

---

## 🔑 PRE-CONFIGURED DEMO CREDENTIALS

| Account Type | Email | Password | Permissions |
|---|---|---|---|
| **Demo Student** | `alex.morgan@university.edu` | `StudentPass123!` | Reserve seats, browse catalogue, borrow books, view QR pass |
| **Demo Admin** | `admin@seatsync.edu` | `AdminPassword123!` | Manage seats, approve/reject loans, record returns, view Recharts analytics |

*(Both login screens include 1-click test fill buttons for instant review).*

---

## 📄 ACADEMIC SOFTWARE ENGINEERING SYLLABUS ALIGNMENT

Refer to [`docs/SOFTWARE_ENGINEERING_DOCUMENTATION.md`](./docs/SOFTWARE_ENGINEERING_DOCUMENTATION.md) for:
- **UNIT 1:** Software Ethics (ACM/IEEE compliance), Problem Statement, Functional (FR-1–FR-18) and Non-Functional (NFR-1–NFR-8) requirements, Agile Scrum vs Waterfall justification.
- **UNIT 2:** Modular Monolith Architecture, Kruchten's 4+1 View Model, SOLID principles, UML Use Case Diagram, UML Class Diagram, UML Sequence Diagrams, UML Activity Diagrams, and 3NF/BCNF Normalized Entity-Relationship Diagram (ERD).
