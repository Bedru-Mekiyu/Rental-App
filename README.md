# Rental Management System (RMS)

A secure, large-scale Rental Management System designed for commercial and residential properties. Built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js) and Tailwind CSS for a modern, responsive UI.

---

## 📛 Badges

### 🖥️ Core Stack
![Stack](https://img.shields.io/badge/Stack-MERN-3C873A?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge)
![Express.js](https://img.shields.io/badge/Backend-Express.js-000000?style=for-the-badge)
![React.js](https://img.shields.io/badge/Frontend-React.js-000000?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge)

### 🎨 UI / UX
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38BDF8?style=for-the-badge)
![ShadCN](https://img.shields.io/badge/Components-ShadCN-444?style=for-the-badge)
![Responsive](https://img.shields.io/badge/Responsive-Design-FF6F61?style=for-the-badge)

### 🔐 Security & Auth
![JWT](https://img.shields.io/badge/Auth-JWT-FFB400?style=for-the-badge)
![RBAC](https://img.shields.io/badge/Security-RBAC-8A2BE2?style=for-the-badge)
![BCrypt](https://img.shields.io/badge/Password-BCrypt-0A66C2?style=for-the-badge)

### 📦 DevOps & Deployment
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-181717?style=for-the-badge)
![Cloud](https://img.shields.io/badge/Cloud-Ready-00A8E8?style=for-the-badge)

### 🧰 Developer Tools
![Postman](https://img.shields.io/badge/API-Postman-F76935?style=for-the-badge)
![VSCode](https://img.shields.io/badge/Editor-VSCode-007ACC?style=for-the-badge)
![npm](https://img.shields.io/badge/PackageManager-npm-CB0000?style=for-the-badge)

### 💳 Payments & Integrations
![Telebirr](https://img.shields.io/badge/Payments-Telebirr-F7B500?style=for-the-badge)
![CBE-Birr](https://img.shields.io/badge/Payments-CBE%20Birr-1E90FF?style=for-the-badge)
![Chapa](https://img.shields.io/badge/Payments-Chapa-5A67D8?style=for-the-badge)

### 📦 Extras
![Linting](https://img.shields.io/badge/Code%20Quality-ESLint-4B32C3?style=for-the-badge)
![Formatting](https://img.shields.io/badge/Formatting-Prettier-F7B93E?style=for-the-badge)

---

## 👥 Team

| Role      | Member        |
|-----------|---------------|
| Advisor   | Erzik         |
| Developer | Suad          |
| Developer | Sumeya        |
| Developer | Yasin         |
| Developer | Bedru Mekiyu  |

---

## 📚 Table of Contents

- [Overview](#-overview)  
- [Key Goals](#-key-goals)  
- [Core Features](#-core-features)  
  - [User & Role Management](#-user--role-management)  
  - [Unit & Property Management](#-unit--property-management)  
  - [Lease & Tenant Management](#-lease--tenant-management)  
  - [Payment Management](#-payment-management)  
  - [Audit Logging & Compliance](#-audit-logging--compliance)  
- [Technology Stack](#-technology-stack)  
- [Project Structure](#-project-structure)  
  - [Backend Layout](#backend-layout)  
  - [Planned Frontend Layout](#planned-frontend-layout)  
- [Key Backend Concepts](#-key-backend-concepts)  
- [Getting Started](#-getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Clone & Install](#clone--install)  
  - [Configure Environment](#configure-environment)  
  - [Run (Development)](#run-development)  
- [Roadmap](#-roadmap)  
- [Why This Platform](#-why-this-platform)  
- [License](#-license)

---

## 📌 Overview

RMS is a web-based platform that digitalizes and automates end-to-end rental operations for property management companies handling large portfolios of commercial and residential units. It centralizes data for units, tenants, leases, payments, and financial performance to enable accurate, real-time decision making.

---

## 🎯 Key Goals

- Replace manual/spreadsheet workflows with a single source of truth.  
- Support secure, role-based access for all stakeholders.  
- Scale to thousands of units and users with high performance and reliability.

---

## 🧩 Core Features

### 🔐 User & Role Management

- Secure authentication for all user types.  
- Role-Based Access Control (RBAC) with clearly separated permissions.  
- Core roles:  
  - Administrator  
  - General Manager  
  - Property Manager  
  - Financial Staff  
  - Tenant

### 🏢 Unit & Property Management

- Create, update, and manage rental units and their attributes.  
- Track unit status: vacant, occupied, under maintenance.  
- Attributes: floor, type, area, base price, view, amenities.

### 📄 Lease & Tenant Management

- Link tenants to units with structured lease documents.  
- Define lease periods, rent amounts, and tax/VAT parameters.  
- Future features: digital signatures, immutable PDFs, automated lease expiry notifications.

### 💳 Payment Management

- Supports manual and digital payments (Telebirr, CBE Birr, Chapa planned).  
- Upload and store payment receipts / bank slips.  
- Manual payment verification workflow and financial status tracking.

### 🧾 Audit Logging & Compliance

- Centralized audit logs for logins, payments, lease changes, and more.  
- Designed to support regulatory and internal compliance requirements.

---

## 🧰 Technology Stack

### Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JWT Authentication  
- Bcrypt for password hashing

### Frontend
- React / Next.js (App Router)  
- TailwindCSS  
- ShadCN (planned)

### Infrastructure & Integrations (Planned)
- MongoDB Replica Set  
- Cloud storage for documents  
- SMS/Email gateways  
- Payment integrations: Telebirr, CBE Birr, Chapa

---

## 🗂 Project Structure

### Backend Layout

```
rms-backend/
├─ server.js
├─ src/
│  ├─ config/
│  │  └─ db.js
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Unit.js
│  │  ├─ Lease.js
│  │  ├─ Payment.js
│  │  └─ AuditLog.js
│  ├─ controllers/
│  │  ├─ authController.js
│  │  ├─ userController.js
│  │  ├─ unitController.js
│  │  ├─ leaseController.js
│  │  ├─ paymentController.js
│  │  └─ financeController.js
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ user.routes.js
│  │  ├─ unit.routes.js
│  │  ├─ lease.routes.js
│  │  ├─ payment.routes.js
│  │  └─ finance.routes.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  ├─ errorHandler.js
│  │  └─ security.js
│  ├─ services/
│  │  └─ financialSummaryService.js
│  └─ utils/
│     └─ auditLogger.js
├─ .env.example
├─ package.json
└─ README.md
```

### Planned Frontend Layout

```
rms-frontend/
├─ public/
│  └─ index.html
├─ src/
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ Navbar.tsx
│  │  │  └─ Sidebar.tsx
│  │  ├─ ui/
│  │  └─ charts/
│  ├─ pages/
│  │  ├─ Auth/
│  │  │  └─ LoginPage.tsx
│  │  ├─ Dashboard/
│  │  │  └─ DashboardPage.tsx
│  │  ├─ Units/
│  │  │  └─ UnitsPage.tsx
│  │  ├─ Leases/
│  │  │  └─ LeasesPage.tsx
│  │  ├─ Payments/
│  │  │  └─ PaymentsPage.tsx
│  │  └─ Finance/
│  │     └─ FinanceSummaryPage.tsx
│  ├─ hooks/
│  ├─ lib/
│  │  └─ apiClient.ts
│  ├─ routes/
│  │  └─ AppRouter.tsx
│  ├─ styles/
│  │  └─ index.css
│  ├─ App.tsx
│  └─ main.tsx
├─ tailwind.config.js
├─ postcss.config.js
└─ package.json
```

---

## 🔑 Key Backend Concepts

### Authentication & Sessions
- JWT-based authentication containing user `id` and `role`.  
- Passwords hashed with bcrypt.  
- Token expiry settings aligned with session timeout requirements.

### RBAC (Role-Based Access Control)
- Role embedded in JWT payload.  
- Middleware for endpoint-level permissions.  
- Financial Staff view-only; Managers/Admins handle approvals.

### Data Modeling
- Document schemas optimized for throughput and aggregations.  
- Supports KPIs, rent roll, overdue buckets, financial summaries.  
- Nested structures for pricing, amenities, metadata.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)  
- npm or yarn  
- MongoDB

### Clone & Install
```bash
git clone https://github.com/Bedru-Mekiy/Rental-App.git
cd Rental-App
npm install
```

### Configure Environment

Create `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/rms
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

### Run (Development)

Backend:

```bash
npm start
```

Server runs at:

```
http://localhost:5000
```

Frontend:

```bash
npm run dev
```

---

## 🛣 Roadmap

### Phase 1 — Core Structure
- MERN setup  
- Auth & RBAC  
- CRUD foundations

### Phase 2 — Operations
- Unit management  
- Tenant onboarding  
- Dashboards

### Phase 3 — Finance
- Manual payments  
- Financial summaries  
- Exportable reports

### Phase 4 — Enterprise
- Cloud storage  
- Payment integrations  
- Analytics dashboards

---

## 💡 Why This Platform

- Designed for high-volume rental operations (10,000+ units).  
- Built for long-term scalability and maintainability.  
- Integrated local payment ecosystems.  
- Modular architecture for team collaboration.

---

## 📜 License

This project uses a **custom/commercial license** based on client agreement.
