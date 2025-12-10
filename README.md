# Rental Management System (RMS)

A secure, large-scale Rental Management System designed for commercial and residential properties. Built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js) and Tailwind CSS for a modern, responsive UI.

---

# 📛 Badges

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


# 👥 Team

| Role | Member |
|------|--------|
| Advisor | Erzik |
| Developer | Suad |
| Developer | Sumeya |
| Developer | Yasin |
| Developer | Bedru Mekiyu |

---

## Table of Contents

- [Overview](#overview)  
- [Key Goals](#key-goals)  
- [Core Features](#core-features)  
  - [User & Role Management](#user--role-management)  
  - [Unit & Property Management](#unit--property-management)  
  - [Lease & Tenant Management](#lease--tenant-management)  
  - [Payment Management (Foundation)](#payment-management-foundation)  
  - [Audit Logging & Compliance](#audit-logging--compliance)  
- [Technology Stack](#technology-stack)  
- [Project Structure (Planned Backend Layout)](#project-structure-planned-backend-layout)  
- [Key Backend Concepts](#key-backend-concepts)  
  - [Authentication & Sessions](#authentication--sessions)  
  - [RBAC (Role-Based Access Control)](#rbac-role-based-access-control)  
  - [Data Modeling](#data-modeling)  
- [Getting Started (Development)](#getting-started-development)  
  - [Prerequisites](#prerequisites)  
  - [Clone & Install](#clone--install)  
  - [Configure Environment](#configure-environment)  
  - [Run (Development)](#run-development)  
- [Roadmap (High-Level Phases)](#roadmap-high-level-phases)  
- [Why This Platform](#why-this-platform)  
- [License](#license)

---

## 📌 Overview

RMS is a web-based platform that digitalizes and automates end-to-end rental operations for property management companies handling thousands of units. It centralizes data for units, tenants, leases, payments, and financial performance to enable real-time decision making.

## 🎯 Key Goals

- Replace manual/spreadsheet workflows with a single source of truth  
- Support secure, role-based access for all stakeholders  
- Scale to thousands of units with high performance and reliability

## 🧩 Core Features

### 🔐 User & Role Management
- Secure authentication for all user types  
- Role-Based Access Control (RBAC) with separate permissions  
- Core roles: Administrator, General Manager, Property Manager, Financial Staff, Tenant

### 🏢 Unit & Property Management 
- Create, update, and manage rental units and attributes  
- Track unit status: vacant, occupied, under maintenance  
- Attributes: floor, type, area, base price, view, amenities (parking, balcony, elevator)

### 📄 Lease & Tenant Management
- Link tenants to units with structured lease documents  
- Define lease periods, rent amounts, tax/VAT parameters  
- Future enhancements: digital signatures, immutable lease PDFs, automated expiry notifications


### 💳 Payment Management
- Manual & digital payments  
- Upload receipts / bank slips  
- Telebirr, CBE Birr integration planned  

### 🧾 Audit Logging
- Tracks logins, payments, lease changes  
- Useful for compliance & transparency  




---

# 🧰 Technology Stack

### Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JWT Authentication  

### Frontend
- React 
- TailwindCSS  

### Infrastructure
- Cloud storage  
- Payment gateway integrations  
- SMS notifications  

---


### Infrastructure & Integrations (Planned)
- MongoDB Replica Set for HA  
- Cloud storage for PDFs and receipt images  
- SMS/Email gateways for notifications and MFA  
- Payment gateway integrations (Telebirr, CBE Birr, Chapa)

##  🗂 Project Structure(Planned Backend Layout)

rms-backend/  
├─ src/  
│  ├─ config/  
│  │  └─ db.js  
│  ├─ models/  
│  │  ├─ User.js  
│  │  ├─ Unit.js  
│  │  ├─ Lease.js  
│  │  ├─ Payment.js  
│  │  └─ AuditLog.js  
│  ├─ middleware/  
│  │  ├─ auth.js  
│  │  └─ errorHandler.js  
│  ├─ routes/  
│  │  ├─ auth.routes.js  
│  │  ├─ user.routes.js  
│  │  ├─ unit.routes.js  
│  │  ├─ lease.routes.js  
│  │  └─ payment.routes.js  
│  ├─ controllers/
│  ├─ services/  
│  └─ utils/  
├─ .env.example  
├─ package.json  
└─ README.md

## Key Backend Concepts

### Authentication & Sessions
- JWT-based authentication  
- Passwords stored as hashes only  
- Configurable session timeout and token expiration

### RBAC (Role-Based Access Control)
- Role embedded in JWT payload  
- Route-level authorization middleware to restrict actions by role:
  - Admin: system setup, user/role management  
  - Property Manager: units, leases, maintenance  
  - Financial Staff: financial ops, invoices, receipts  
  - Tenant: self-service portal actions

### Data Modeling
- Document-oriented models optimized for high read/write throughput  
- Support for complex aggregations (KPIs, rent roll, overdue buckets)  
- Nested structures for pricing rules, amenities, and signature metadata

## Getting Started (Development)

### Prerequisites
- Node.js (LTS)  
- npm or yarn  
- MongoDB (local or remote)

### Clone & Install
```bash
git clone https://github.com/Bedru-Mekiy/Rental-App.git
cd Rental-App
npm install
```


Structuring the README markdown...
Configure Environment
Create a .env from .env.example and set:
MONGODB_URI
JWT_SECRET
PORT

# 🚀 Getting Started
## Run (Development)
```bash

npm run dev
```



---

## Configure Environment

Create a `.env` file based on `.env.example`:

```
MONGODB_URI=
JWT_SECRET=
PORT=5000
```

---

## Run App (Development)

```bash
npm run dev
```

The server will run at:

```
http://localhost:5000
```

---

# 🛣 Roadmap

### Phase 1 – Core Structure
- MERN setup  
- Authentication & RBAC  
- CRUD foundation  

### Phase 2 – Operations
- Units  
- Tenants  
- Leases  

### Phase 3 – Finance
- Manual/Digital payments  
- Financial dashboard  

### Phase 4 – Enterprise
- Cloud file storage  
- Payment gateway integrations  
- Analytics dashboard  



# 📜 License

This project uses a **custom/commercial license** based on client agreement.

