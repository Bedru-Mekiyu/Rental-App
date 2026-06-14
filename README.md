# Rental Management System (RMS)

[![Stack](https://img.shields.io/badge/Stack-MERN-3C873A?style=flat-square)](https://www.mongodb.com/mern-stack)
[![Express](https://img.shields.io/badge/Backend-Express.js_5-000000?style=flat-square)](https://expressjs.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square)](https://www.mongodb.com/)
[![Railway](https://img.shields.io/badge/Deployed-Railway-0B0D0E?style=flat-square)](https://railway.app/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square)](https://vercel.com/)

End-to-end rental property management platform digitalizing operations for commercial and residential portfolios. Built with **Express 5 + Mongoose 8** on the backend and **React 19 + TypeScript + Tailwind CSS + shadcn/ui** on the frontend.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Design](#database-design)
- [API Overview](#api-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Security](#security)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

**RMS** replaces spreadsheet-driven property management with a secure, real-time platform. It centralizes unit tracking, lease management, payment processing, financial reporting, and stakeholder communication — all behind role-based access control.

The system serves **property companies managing thousands of units**, enabling each stakeholder (tenants, property managers, financial staff, executives) to work from a single source of truth.

---

## Key Features

### Authentication & Security
- JWT access/refresh token authentication with automatic rotation
- Two-factor authentication (TOTP + Email OTP + backup codes)
- Role-based access control (RBAC) with granular permissions
- Session management (max 5 concurrent sessions, idle timeout)
- Password policy enforcement (complexity, expiry, history)
- Field-level encryption (AES-256-GCM) for PII (SSN, phone, bank info)
- API key authentication for programmatic access
- CSRF protection (double-submit cookie pattern)
- Rate limiting (3-layer: DDoS + global + per-endpoint)
- Input sanitization (DOMPurify) against XSS
- Comprehensive audit logging (dual AuditLog + ActivityLog)

### Property Management
- CRUD properties with manager assignment
- Unit CRUD with status tracking (vacant / occupied / maintenance)
- Unit attributes: floor, type, area, base price, view, amenities (parking, balcony, elevator)
- Pricing calculation with floor and amenity multipliers
- Soft delete with `isDeleted` flag

### Lease Management
- Full lease CRUD linked to tenant + unit
- Lease status workflow: PENDING → ACTIVE → TERMINATED
- Lease termination with automatic unit status rollback
- Payment schedule generation (monthly / quarterly / annually)
- Invoice generation with line items

### Payment Processing
- Payment recording with idempotency keys
- Verification workflow (pending → verified / rejected)
- Payment proof upload with image processing (sharp)
- Bulk payment uploads (CSV / XLSX via exceljs)
- Mobile money integration (Chapa, Telebirr, Bell)
- Payment reconciliation with discrepancy detection
- Payment disputes with evidence and communication history
- Webhook processing (Stripe, Chapa, Flutterwave)

### Financial Reporting
- Portfolio-wide metrics (occupancy rate, collection rate, 12-month trends)
- Monthly revenue reports by property
- Occupancy reports
- Lease financial summaries
- Dispute reports
- Dashboard analytics (payment trends, method breakdown, property performance)

### Maintenance
- Maintenance request submission with priority levels (LOW / MEDIUM / HIGH / URGENT)
- Status workflow: PENDING → IN_PROGRESS → COMPLETED / CANCELLED
- Estimated cost tracking

### Notifications & Communication
- Email via multi-provider (Gmail, SendGrid, AWS SES, SMTP) via Nodemailer
- SMS via Infobip-compatible API
- WhatsApp Business API integration
- Notification templates (payment due / overdue / received, lease expiring, maintenance updates, disputes)
- Scheduled job queue with retry (max 3 attempts) and email delivery tracking

### System & DevOps
- Health check endpoints (`/health`, `/ready`) with DB + Redis + API response checks
- System metrics monitoring (CPU, memory, DB connection, Redis, error rate)
- Sentry error tracking
- Automated database backups to S3 (full + incremental)
- Scheduled jobs via node-cron + node-schedule (overdue payments, lease expiry, job queue, daily reports)
- Data retention & GDPR compliance tooling

---

## User Roles

| Role | Identifier | Capabilities |
|------|-----------|--------------|
| **Administrator** | `ADMIN` | Full system access, user & role management, API key management, all CRUD operations |
| **General Manager** | `GM` | Company-wide metrics, reports, lease/unit visibility, maintenance oversight |
| **Property Manager** | `PM` | Property/unit/lease CRUD, payment verification, maintenance management, tenant management |
| **Financial Staff** | `FS` | Payment processing, financial reports, reconciliation, invoice management |
| **Tenant** | `TENANT` | Self-service portal, view lease, pay rent, submit maintenance requests, upload payment proof |

---

## Architecture

```
[Vercel]                                            [Railway]
Frontend (React 19 + Vite)                          Backend (Express 5)
  |                                                    |
  | VITE_API_URL / /api/* proxy ---------------------> |
  |                                                    |
  |   ┌─────────────────────────┐     ┌──────────────────────────────┐
  |   │  Frontend Architecture  │     │   Backend Architecture       │
  |   │                         │     │                              │
  |   │  App.tsx (Router)       │     │  server.js                   │
  |   │   ├─ Layouts            │     │   ├─ CORS → Helmet → CSRF   │
  |   │   ├─ Pages (28)         │     │   ├─ DDoS → Sanitize → Encrypt│
  |   │   ├─ Components (15)    │     │   ├─ Auth → RBAC → Ratelimit │
  |   │   ├─ Zustand Stores     │     │   ├─ Validate → Routes       │
  |   │   ├─ TanStack Query     │     │   ├─ Error Handler → Sentry │
  |   │   └─ shadcn/ui (30+)    │     │   └─ Audit Logger            │
  |   └─────────────────────────┘     └──────────────────────────────┘
  |                                                    |
  |                                              [MongoDB Atlas]
  |                                              [Redis (rate-limit)]
  |                                              [AWS S3 (backups)]
  |                                              [Email Provider]
  |                                              [Sentry]
```

### Security Pipeline (Applied in Order)

```
Request → Correlation ID → CORS → Helmet/HSTS → DDoS Guard → CSRF
       → Sanitization → Encryption → JWT Verify → 2FA Check → RBAC
       → Rate Limiting → Validation → Payload Limit → Audit Log → Sentry
```

---

## Tech Stack

### Backend

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 5.x |
| Database | MongoDB + Mongoose 8.x |
| Caching | Redis (via `rate-limit-redis`) |
| Authentication | JWT (`jsonwebtoken`), `bcryptjs`, `speakeasy`, `qrcode` |
| Validation | `zod`, `express-validator`, `dompurify`, `isomorphic-dompurify` |
| File Upload | `multer`, `sharp`, `@aws-sdk/client-s3` |
| Email | `nodemailer` (Gmail / SendGrid / AWS SES / SMTP) |
| Scheduling | `node-cron`, `node-schedule` |
| Monitoring | `@sentry/node`, `winston` |
| CSV/Excel | `csv-parser`, `exceljs` |
| Security | `helmet`, `csrf-csrf`, `express-rate-limit` |

### Frontend

| Category | Technology |
|----------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 5 |
| Routing | react-router-dom |
| State Management | Zustand + TanStack Query |
| Styling | Tailwind CSS + tailwindcss-animate |
| UI Library | shadcn/ui (30+ Radix primitives) |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Charts | Recharts |
| Notifications | sonner + react-hot-toast |
| Animation | framer-motion |
| HTTP | Axios (interceptors with token refresh) |

---

## Database Design

The system uses **29 MongoDB collections** organized into domains:

### Core Business
- `users` — User accounts with roles, profile, 2FA settings, status
- `properties` — Property records with manager assignment, soft delete
- `units` — Rental units linked to properties, with pricing, amenities, status
- `leases` — Lease agreements linking tenants to units, with terms and workflow
- `payments` — Payment records with idempotency, verification workflow
- `invoices` — Generated invoices with line items
- `maintenancerequests` — Maintenance tickets with priority and status

### Auth & Security
- `sessions` — Active user sessions (max 5 per user)
- `refreshtokens` — JWT refresh token rotation
- `twofactorauths` — 2FA methods (TOTP, email, backup codes)
- `apikeys` — Programmatic API keys with permissions
- `passwordhistories` — Password change history

### Financial
- `paymentproofs` — Uploaded receipt/slip images
- `paymentdisputes` — Dispute records with evidence
- `paymentreconciliations` — Bank statement reconciliation
- `paymentschedules` — Generated payment schedules from leases
- `bulkpaymentuploads` — Bulk CSV/XLSX uploads

### Logging & Monitoring
- `auditlogs` — Detailed action audit trail
- `activitylogs` — User activity stream
- `emaillogs` — Email delivery tracking
- `smslogs` — SMS delivery tracking
- `webhookevents` — Incoming webhook event log

### System
- `jobqueues` — Scheduled job queue with retry
- `idempotencykeys` — Idempotency for payment processing
- `consentlogs` — GDPR consent records
- `dataretentions` — Data retention policy config
- `ipwhitelists` — IP whitelist for admin access
- `notifications` — User notification preferences

---

## API Overview

The backend exposes ~80+ endpoints across 14 route modules:

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register admin user |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/verify-2fa` | Verify 2FA code |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (invalidate session) |

### Users
| Method | Endpoint(s) | Description |
|--------|-------------|-------------|
| GET/POST | `/api/users` | List / create users |
| GET/PUT/DELETE | `/api/users/:id` | Get / update / delete user |
| PATCH | `/api/users/:id/deactivate` | Deactivate user |
| PATCH | `/api/users/:id/reactivate` | Reactivate user |

### Properties
`GET/POST /api/properties`, `GET/PUT/DELETE /api/properties/:id`

### Units
`GET/POST /api/units`, `GET/PUT/DELETE /api/units/:id`

### Leases
`GET/POST /api/leases`, `GET/PUT/DELETE /api/leases/:id`, `POST /api/leases/:id/terminate`

### Payments
`GET/POST /api/payments`, `GET/PUT/DELETE /api/payments/:id`, `POST /api/payments/:id/verify`, `POST /api/payments/:id/reject`, `POST /api/payments/:id/proof`

### Maintenance
`GET/POST /api/maintenance`, `GET/PUT/DELETE /api/maintenance/:id`

### Finance
`GET /api/finance/portfolio-summary`, `GET /api/finance/leases/:id/summary`, `GET /api/finance/reports/*`

### Notifications
`GET/PUT /api/notifications/preferences`, `GET /api/notifications/email-history`, `POST /api/notifications/send`

### And more:
- `/api/api-keys` — CRUD API keys
- `/api/payments/mobile` — Mobile money operations
- `/api/payments/bulk` — Bulk payment uploads
- `/api/invoices` — Invoice CRUD
- `/api/disputes` — Payment dispute management
- `/api/reconciliation` — Payment reconciliation
- `/api/analytics` — Dashboard analytics & trends
- `/api/webhooks` — Stripe / Chapa / Flutterwave webhooks

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn**
- **MongoDB** 6+ (local or Atlas)
- **Redis** (optional, defaults to in-memory for rate limiting)

### Clone & Install

```bash
git clone https://github.com/Bedru-Mekiy/Rental-App.git
cd Rental-App

# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp env.example .env.local
npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token signing secret |
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `5000` | Server port |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |
| `REDIS_URL` | No | — | Redis connection string |
| `EMAIL_HOST` | Varies | — | SMTP host |
| `EMAIL_PORT` | No | `587` | SMTP port |
| `EMAIL_USER` | Varies | — | SMTP user |
| `EMAIL_PASS` | Varies | — | SMTP app password |
| `SENDGRID_API_KEY` | Varies | — | SendGrid API key |
| `SES_REGION` | Varies | — | AWS SES region |
| `SES_ACCESS_KEY_ID` | Varies | — | AWS SES access key |
| `SES_SECRET_ACCESS_KEY` | Varies | — | AWS SES secret key |
| `AWS_ACCESS_KEY_ID` | Varies | — | AWS S3 access key |
| `AWS_SECRET_ACCESS_KEY` | Varies | — | AWS S3 secret key |
| `AWS_S3_BUCKET` | Varies | — | S3 bucket name |
| `AWS_REGION` | Varies | — | AWS region |
| `CHAPA_SECRET_KEY` | Varies | — | Chapa payment secret |
| `FLUTTERWAVE_SECRET_KEY` | Varies | — | Flutterwave secret |
| `STRIPE_SECRET_KEY` | Varies | — | Stripe secret key |
| `TELEBIRR_API_KEY` | Varies | — | Telebirr API key |
| `SENTRY_DSN` | No | — | Sentry error tracking DSN |
| `ENCRYPTION_KEY` | Varies | — | AES-256-GCM encryption key (64 hex chars) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:5000/api` | Backend API base URL |

---

## Running Locally

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Backend: `http://localhost:5000` (health: `http://localhost:5000/health`)
- Frontend: `http://localhost:5173`

---

## Scripts

### Backend

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `node --watch src/server.js` | Development with auto-restart |
| `npm start` | `node src/server.js` | Production start |
| `npm test` | `jest --passWithNoTests` | Run tests |
| `npm run lint` | `eslint src/` | Lint source |
| `npm run format` | `prettier --write src/` | Format source |
| `npm run init:admin` | — | Create initial admin user |
| `npm run test:email` | — | Test email configuration |
| `npm run test:2fa` | — | Test 2FA setup |
| `npm run health:check` | — | Health check endpoint test |
| `npm run health:check:all` | — | Full system health check |
| `npm run migrate:encrypt` | — | Encrypt existing PII data |
| `npm run migrate:indexes` | — | Create DB indexes |

### Frontend

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `vite` | Development server |
| `npm run build` | `vite build` | Production build |
| `npm run build:dev` | `vite build --mode development` | Dev build |
| `npm run preview` | `vite preview` | Preview production build |
| `npm run lint` | `eslint .` | Lint source |

---

## Project Structure

```
rentalapp/
├── backend/                          # Express 5 API
│   ├── src/
│   │   ├── config/                   # DB, email, encryption config
│   │   ├── controllers/              # 21 controllers
│   │   ├── middleware/               # 17 middleware (auth, RBAC, security, validation, encryption, audit)
│   │   ├── models/                   # 29 Mongoose schemas
│   │   ├── routes/                   # 14 route modules (~80+ endpoints)
│   │   ├── services/                 # 26 services (2FA, email, encryption, payments, reports, etc.)
│   │   ├── utils/                    # Audit logger, pagination, Redis, sanitization, etc.
│   │   ├── templates/                # Email templates
│   │   └── scripts/                  # 10 utility scripts
│   ├── uploads/receipts/             # Payment proof uploads
│   ├── server.js                     # Entry point
│   └── railway.json                  # Railway config
│
├── frontend/                         # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── pages/                    # 28 page components
│   │   ├── components/ui/            # shadcn/ui primitives (30+)
│   │   ├── components/               # Reusable custom components (15)
│   │   ├── hooks/                    # use-mobile, use-toast, useNotifications, useWebSocket
│   │   ├── services/                 # API client (Axios with interceptors)
│   │   ├── store/                    # Zustand stores (auth, etc.)
│   │   ├── context/                  # AuthContext (legacy)
│   │   ├── layouts/                  # DashboardLayout
│   │   └── assets/                   # Screenshots, SVGs
│   ├── vercel.json                   # Vercel config with /api/* proxy
│   └── railway.json                  # Railway config
│
├── .gitignore
└── vercel.json                       # Root Vercel config
```

---

## Deployment

### Backend → Railway

The backend is configured for Railway deployment via `backend/railway.json`:

```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

1. Create a new Railway project from your GitHub repo
2. Set root directory to `backend`
3. Add required environment variables (see [env vars](#backend-backendenv))
4. Deploy

### Frontend → Vercel

Configured via `frontend/vercel.json`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://<backend>.up.railway.app/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

The root `vercel.json` also proxies `/api/*` to the Railway backend.

### CORS Configuration

Backend CORS is dynamically resolved:
- Reads `CORS_ORIGINS` env var (comma-separated)
- Falls back to `http://localhost:5173` in development
- Accepts any `*.vercel.app` subdomain automatically
- Order: deploy backend → deploy frontend → update `CORS_ORIGINS` → redeploy backend

---

## Security

RMS implements a defense-in-depth security architecture with 14 layers:

| Layer | Protection | Implementation |
|-------|-----------|---------------|
| 1 | Correlation ID | Request tracing across services |
| 2 | CORS | Origin whitelist with wildcard Vercel support |
| 3 | HTTP Headers | Helmet (HSTS, CSP, X-Frame-Options, etc.) |
| 4 | DDoS Protection | Connection limiting |
| 5 | CSRF | Double-submit cookie pattern |
| 6 | XSS Prevention | Input sanitization via DOMPurify |
| 7 | Data Encryption | AES-256-GCM field-level encryption for PII |
| 8 | Authentication | JWT access + refresh tokens with rotation |
| 9 | Two-Factor Auth | TOTP (authenticator app) + Email OTP + backup codes |
| 10 | Authorization | RBAC with 5 roles, middleware-enforced |
| 11 | Rate Limiting | 3-tier: DDoS guard + global limiter + per-endpoint |
| 12 | Input Validation | Zod schemas + express-validator |
| 13 | Payload Limits | Body size restrictions |
| 14 | Monitoring | Audit logging + Sentry error tracking |

### Additional Security Features
- Password policy: minimum length, complexity requirements, expiry, history prevention
- Session management: max 5 concurrent sessions, idle timeout, force logout
- API key authentication for machine-to-machine access
- Webhook signature verification (Stripe, Chapa, Flutterwave)
- IP whitelist for admin endpoints
- Data retention & GDPR compliance tooling (consent logging, data lifecycle)

---

## Testing

**Status: Test suite not yet implemented.**

The backend has Jest installed (`npm test` runs `jest --passWithNoTests`), but no test files exist. The frontend does not include any test framework.

Work needed:
- Backend: Unit + integration tests for controllers, services, and middleware
- Frontend: Component tests (Vitest + Testing Library)
- E2E: Playwright or Cypress for critical user flows

---

## Roadmap

### Phase 1 — Core Infrastructure ✅
- [x] Express 5 + MongoDB backend
- [x] React 19 + TypeScript + Vite frontend
- [x] Authentication & RBAC (5 roles)
- [x] shadcn/ui component library

### Phase 2 — Operations ✅
- [x] Property & unit management
- [x] Lease management with workflow
- [x] Tenant self-service portal
- [x] Payment processing with verification

### Phase 3 — Finance & Reporting ✅
- [x] Payment reconciliation
- [x] Invoice generation
- [x] Financial dashboards
- [x] Portfolio analytics & trends

### Phase 4 — Enterprise Features ✅
- [x] File upload & S3 storage
- [x] Mobile money (Chapa, Telebirr, Bell)
- [x] Email/SMS/WhatsApp notifications
- [x] Webhook integrations (Stripe, Chapa, Flutterwave)
- [x] 2FA (TOTP + Email OTP)
- [x] Encryption at rest for PII
- [x] Scheduled jobs & health monitoring
- [x] GDPR compliance tooling

### Phase 5 — Quality & Scale 🔜
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Performance optimization & caching
- [ ] Docker containerization
- [ ] Documentation site
- [ ] Mobile app (React Native)

---

## License

This project uses a **custom/commercial license** based on client agreement. See the repository owner for licensing inquiries.

---

*Built by Suad, Sumeya, Yasin, and Bedru Mekiyu. Advisor: Erzik.*
