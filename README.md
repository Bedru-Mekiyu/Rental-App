# Rental Management System (RMS)

A secure, large-scale Rental Management System designed for commercial and residential properties. Built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js) and Tailwind CSS for a modern, responsive UI. [file:1]

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

| Role     | Member       |
|----------|-------------|
| Advisor  | Erzik       |
| Developer | Suad       |
| Developer | Sumeya     |
| Developer | Yasin      |
| Developer | Bedru Mekiyu |

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

RMS is a web-based platform that digitalizes and automates end-to-end rental operations for property management companies handling large portfolios of commercial and residential units. It centralizes data for units, tenants, leases, payments, and financial performance to enable accurate, real-time decision making. [file:1]

---

## 🎯 Key Goals

- Replace manual/spreadsheet workflows with a single source of truth. [file:1]  
- Support secure, role-based access for all stakeholders. [file:1]  
- Scale to thousands of units and users with high performance and reliability. [file:1]

---

## 🧩 Core Features

### 🔐 User & Role Management

- Secure authentication for all user types. [file:1]  
- Role-Based Access Control (RBAC) with clearly separated permissions. [file:1]  
- Core roles:
  - Administrator  
  - General Manager  
  - Property Manager  
  - Financial Staff  
  - Tenant [file:1]

### 🏢 Unit & Property Management

- Create, update, and manage rental units and their attributes. [file:1]  
- Track unit status: vacant, occupied, under maintenance. [file:1]  
- Attributes: floor, type, area, base price, view, amenities (parking, balcony, elevator). [file:1]

### 📄 Lease & Tenant Management

- Link tenants to units with structured lease documents. [file:1]  
- Define lease periods, rent amounts, and tax/VAT parameters. [file:1]  
- Future enhancements: digital signatures, immutable lease PDFs, automated lease expiry notifications. [file:1]

### 💳 Payment Management

- Support for manual and digital payments (Telebirr, CBE Birr, Chapa planned). [file:1]  
- Upload and store payment receipts / bank slips. [file:1]  
- Manual payment verification workflow and financial status tracking foundation. [file:1][file:4]

### 🧾 Audit Logging & Compliance

- Centralized audit logs for logins, payments, lease changes, and other critical actions. [file:3]  
- Designed to support regulatory and internal compliance requirements. [file:1]

---

## 🧰 Technology Stack

### Backend

- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JWT Authentication  
- Bcrypt for password hashing [file:1]

### Frontend

- React / Next.js (App Router)  
- TailwindCSS for styling  
- ShadCN or similar component library (planned)

### Infrastructure & Integrations (Planned)

- MongoDB Replica Set for high availability. [file:1]  
- Cloud storage for lease PDFs and receipt images. [file:1]  
- SMS/Email gateways for notifications and MFA. [file:1]  
- Payment gateway integrations: Telebirr, CBE Birr, Chapa. [file:1]

---

## 🗂 Project Structure

### Backend Layout

rms-backend/
├─ server.js
├─ src/
│ ├─ config/
│ │ └─ db.js
│ ├─ models/
│ │ ├─ User.js
│ │ ├─ Unit.js
│ │ ├─ Lease.js
│ │ ├─ Payment.js
│ │ └─ AuditLog.js
│ ├─ controllers/
│ │ ├─ authController.js
│ │ ├─ userController.js
│ │ ├─ unitController.js
│ │ ├─ leaseController.js
│ │ ├─ paymentController.js
│ │ └─ financeController.js
│ ├─ routes/
│ │ ├─ auth.routes.js
│ │ ├─ user.routes.js
│ │ ├─ unit.routes.js
│ │ ├─ lease.routes.js
│ │ ├─ payment.routes.js
│ │ └─ finance.routes.js
│ ├─ middleware/
│ │ ├─ auth.js
│ │ ├─ errorHandler.js
│ │ └─ security.js (planned)
│ ├─ services/
│ │ └─ financialSummaryService.js
│ └─ utils/
│ └─ auditLogger.js
├─ .env.example
├─ package.json
└─ README.md


This layout separates configuration, models, controllers, routes, middleware, and services to keep the codebase modular and maintainable. [file:1]

### Planned Frontend Layout

### Frontend Layout (React + Tailwind)

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
│  └─ main.tsx (or index.tsx)
├─ tailwind.config.js
├─ postcss.config.js
└─ package.json


The frontend will consume the backend REST APIs for auth, units, leases, payments, and financial summaries, using Tailwind CSS and reusable components for consistent UI.

---

## 🔑 Key Backend Concepts

### Authentication & Sessions

- JWT-based authentication with tokens containing user `id` and `role`. [file:2]  
- Passwords stored only as hashed values (bcrypt). [file:1]  
- Token expiry configured (e.g., 30 minutes) to align with session timeout requirements. [file:1][file:2]

### RBAC (Role-Based Access Control)

- Role embedded in JWT payload. [file:2]  
- Route-level authorization middleware enforces allowed roles per endpoint (e.g., only PM/ADMIN can create leases or verify payments). [file:10][file:leaseController]  
- FS is restricted to view-only financial data, while PM/ADMIN handle payment verification. [file:4][file:2]

### Data Modeling

- Document-oriented models optimized for high read/write throughput and aggregations. [file:1]  
- Support for KPIs, rent roll, and overdue buckets via aggregation and financial summary services. [file:6]  
- Nested structures for pricing rules, amenities, and digital signature metadata. [file:1]

---

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS)  
- npm or yarn  
- MongoDB (local or remote)  

### Clone & Install


---

git clone https://github.com/Bedru-Mekiy/Rental-App.git
cd Rental-App
npm install
---


### Configure Environment

Create a `.env` file based on `.env.example` and set:

---
MONGODB_URI=mongodb://127.0.0.1:27017/rms
JWT_SECRET=your_jwt_secret_here
PORT=5000

text
---


### Run (Development)

Backend:

---
npm start

---


The server will run at:

---
http://localhost:5000

---


Frontend (once initialized in `rms-frontend/`):

---
npm run dev
---


---

## 🛣 Roadmap

### Phase 1 – Core Structure

- MERN stack setup (backend + frontend skeleton). [file:1]  
- Authentication & RBAC. [file:1]  
- Core CRUD foundations (users, units, leases). [file:1]

### Phase 2 – Operations

- Full unit management and pricing logic. [file:1]  
- Tenant onboarding and lease workflows. [file:1]  
- Basic dashboards for operations.

### Phase 3 – Finance

- Manual payment workflows and verification. [file:1][file:4]  
- Financial summaries and rent roll basics. [file:6]  
- Exportable reports (CSV/PDF planned). [file:1]

### Phase 4 – Enterprise

- Cloud file storage for leases and receipts. [file:1]  
- Payment gateway integrations (Telebirr, CBE Birr, Chapa). [file:1]  
- Advanced analytics dashboards and performance tuning. [file:1]

---

## 💡 Why This Platform

- Designed specifically for high-volume rental operations (10,000+ units). [file:1]  
- Built on modern, proven technologies for long-term maintainability. [file:1]  
- Aligned with local payment ecosystems and regulatory expectations. [file:1]  
- Modular architecture that lets different team members own clear backend and frontend areas.

---

## 📜 License

This project uses a **custom/commercial license** based on client agreement and is intended for professional deployment and extension.



