
# Rental Management System (RMS)

A secure, large-scale Rental Management System designed for commercial and residential properties. Built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js) and Tailwind CSS for a modern, responsive UI.




### Team Roles

| Role | Team member |
| --- | --- |
| Erzik | Advisor |
| Suad |  |
| Sumeya |  |
| Yasin |  |
| Bedru Mekiyu |  |


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

## Overview

RMS is a web-based platform that digitalizes and automates end-to-end rental operations for property management companies handling thousands of units. It centralizes data for units, tenants, leases, payments, and financial performance to enable real-time decision making.

## Key Goals

- Replace manual/spreadsheet workflows with a single source of truth  
- Support secure, role-based access for all stakeholders  
- Scale to thousands of units with high performance and reliability

## Core Features

### User & Role Management
- Secure authentication for all user types  
- Role-Based Access Control (RBAC) with separate permissions  
- Core roles: Administrator, General Manager, Property Manager, Financial Staff, Tenant

### Unit & Property Management
- Create, update, and manage rental units and attributes  
- Track unit status: vacant, occupied, under maintenance  
- Attributes: floor, type, area, base price, view, amenities (parking, balcony, elevator)

### Lease & Tenant Management
- Link tenants to units with structured lease documents  
- Define lease periods, rent amounts, tax/VAT parameters  
- Future enhancements: digital signatures, immutable lease PDFs, automated expiry notifications

### Payment Management (Foundation)
- Data model for manual and digital payments tied to leases  
- Support for cash, bank, and local gateways (Telebirr, CBE Birr, etc.)  
- Receipt file storage links for uploaded bank slips/receipts  
- Basis for manual verification workflows and overdue tracking

### Audit Logging & Compliance
- Centralized audit logs for key actions (login, lease changes, payment verification)  
- Traceability across users, entities, and timestamps

## Technology Stack

### Backend
- Node.js + Express.js  
- MongoDB with Mongoose ODM  
- JSON Web Tokens (JWT) for auth  
- Bcrypt for password hashing

### Frontend
- React / Next.js (app/router structure)  
- Tailwind CSS for styling and responsive UI

### Infrastructure & Integrations (Planned)
- MongoDB Replica Set for HA  
- Cloud storage for PDFs and receipt images  
- SMS/Email gateways for notifications and MFA  
- Payment gateway integrations (Telebirr, CBE Birr, Chapa)

## Project Structure (Planned Backend Layout)

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
Run (Development)
```bash

npm run dev
```

The API will start on the configured port (e.g., http://localhost:5000).

Roadmap (High-Level Phases)
Phase 1: Core Access & Structure — MERN setup, MongoDB collections, user model, auth, RBAC
Phase 2: Operations & Finance — Unit CRUD, lease basics, manual payments, financial dashboard
Phase 3: Analytics & Integrations — Occupancy analytics, cloud storage, payment/SMS integrations, hardening
Why This Platform
Designed for high-volume rental operations (10,000+ units)
Built on modern technologies (MERN + Tailwind)
Structured around roles and responsibilities, extensible for future integrations
License
This project can be provided under a commercial or custom license as agreed with the client.


# Rental Management System (RMS)

A secure, scalable rental management platform for commercial & residential properties, built using the MERN stack.

---

# 📛 Badges

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Status](https://img.shields.io/badge/Status-Under_Development-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-Custom-blue?style=for-the-badge)

---

# 📸 Architecture Diagram

> Replace the image below with your own architecture image  
> Example: `/docs/architecture.png`

![Architecture Diagram](https://via.placeholder.com/1200x500?text=Architecture+Diagram)

---

# 🎥 Installation Demo (GIF)

> Replace with your own GIF  
> Example: `/docs/install-demo.gif`

![Installation GIF](https://via.placeholder.com/800x400?text=Installation+GIF)

---

# 📑 Table of Contents

- [Overview](#overview)
- [Key Goals](#key-goals)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [License](#license)

---

# 📌 Overview

RMS is a cloud-ready system designed to modernize rental operations for large-scale organizations handling thousands of units.

---

# 🎯 Key Goals

- Centralize data as a **single source of truth**
- Provide **secure RBAC** for users
- Support **10,000+ units** at enterprise scale
- Digitize leases, payments, and tenant workflows

---

# 🧩 Core Features

## 🔐 User & Role Management
- JWT authentication  
- RBAC with Admin, Manager, Finance, Tenant  
- Activity-based permissions  

## 🏢 Unit & Property Management
- Unit CRUD  
- Status tracking (vacant, occupied, maintenance)  
- Details: floor, type, area, view, amenities  

## 📄 Lease & Tenant Management
- Lease creation  
- Pricing rules & VAT  
- Future: digital signature + PDF generation  

## 💳 Payment Management
- Manual & digital payments  
- Upload receipts / bank slips  
- Telebirr, CBE Birr integration planned  

## 🧾 Audit Logging
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
- React / Next.js  
- TailwindCSS  

### Infrastructure
- Cloud storage  
- Payment gateway integrations  
- SMS notifications  

---

# 🗂 Project Structure

```
rms-backend/
├─ src/
│  ├─ config/
│  ├─ models/
│  ├─ controllers/
│  ├─ routes/
│  ├─ middleware/
│  └─ utils/
├─ .env.example
├─ package.json
└─ README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js LTS  
- MongoDB  
- npm or yarn  

---

## Clone & Install

```bash
git clone https://github.com/Bedru-Mekiy/Rental-App.git
cd Rental-App
npm install
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

---

# 👥 Team

| Role | Member |
|------|--------|
| Advisor | Erzik |
| Developer | Suad |
| Developer | Sumeya |
| Developer | Yasin |
| Developer | Bedru Mekiyu |

---

# 📜 License

This project uses a **custom/commercial license** based on client agreement.

