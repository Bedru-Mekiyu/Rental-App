
# Rental Management System (RMS)

A secure, large-scale Rental Management System designed for commercial and residential properties. Built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js) and Tailwind CSS for a modern, responsive UI.

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