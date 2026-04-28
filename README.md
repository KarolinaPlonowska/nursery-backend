# Nursery Management System

Comprehensive web application for managing nursery operations: users (admin, parent, caregiver), children, groups and attendance. This repo contains both backend (NestJS + TypeORM + PostgreSQL) and frontend (React + Ant Design) code.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Prerequisites](#prerequisites)
- [Local setup (backend)](#local-setup-backend)
- [Local setup (frontend)](#local-setup-frontend)
- [Running with Docker Compose](#running-with-docker-compose)
- [Environment variables](#environment-variables)
- [Database and migrations](#database-and-migrations)
- [Security & Best Practices](#security--best-practices)
- [Testing](#testing)
- [API Endpoints (summary)](#api-endpoints-summary)
- [Roles and User Flows](#roles-and-user-flows)
- [Logging & Monitoring](#logging--monitoring)
- [Deployment notes (Azure / Docker)](#deployment-notes-azure--docker)
- [Troubleshooting](#troubleshooting)
- [Further improvements](#further-improvements)

---

## Overview

This project implements a role-based nursery management system. It supports:

- User registration and authentication (JWT)
- Role-based access control (Admin, Parent, Caregiver)
- Creating and listing children, groups and attendance records
- Secure password storage (bcrypt)
- Rate-limiting for auth endpoints
- Frontend UI built with React + Ant Design

## Architecture & Tech Stack

- Backend: NestJS, TypeScript, TypeORM, PostgreSQL
- Frontend: React, TypeScript, Ant Design, Vite
- Auth: JWT tokens, role-based guards
- Logging: winston via nest-winston
- Rate limiting: rate-limiter-flexible (Auth rate limiter service)
- Password hashing: bcrypt

## Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- Docker & Docker Compose (recommended for production/local reproducible setup)
- PostgreSQL (if running without Docker)

## Local setup (backend)

1. Move to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file in `backend/` with the required variables (see [Environment variables](#environment-variables)).

4. Build and run (development):

```bash
npm run build
npm run start:dev
```

## Local setup (frontend)

1. Move to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` in `frontend/` (if needed) with `VITE_API_URL` pointing to backend.

4. Start dev server:

```bash
npm run dev
```

## Running with Docker Compose

1. Ensure `docker` and `docker-compose` are installed.
2. Create `backend/.env` and `frontend/.env` with proper values (see below).
3. Use the provided `docker-compose.yml` (or create one like in project docs) and run:

```bash
docker-compose up --build -d
```

Access frontend (default) at `http://localhost:5173` and backend at `http://localhost:3000`.

## Environment variables

Backend (.env) should include at least:

```
DATABASE_URL=postgres://user:password@db:5432/nursery
JWT_SECRET=replace_with_a_secure_secret
NODE_ENV=production
PORT=3000
```

Frontend (.env) (Vite):

```
VITE_API_URL=http://localhost:3000
```

## Database and migrations

This project uses TypeORM. To run migrations (if present):

```bash
# from backend
npm run typeorm migration:run
```

If running without migrations, ensure the database schema is created either by TypeORM `synchronize` (not recommended in production) or by running SQL migrations.

## Security & Best Practices

Key controls implemented in the project:

- JWT-based authentication with token verification on backend guards
- Role-Based Access Control (RBAC) via `RolesGuard` and `@Roles()` decorator
- Password hashing using `bcrypt` (never store plaintext passwords)
- Rate limiting on authentication endpoints (`AuthRateLimiterService`) to mitigate brute-force
- Input validation at multiple layers:
  - Frontend: Ant Design form `rules` (client-side)
  - Backend: DTOs with `class-validator` (server-side)
  - Database: column constraints and types (TypeORM/Postgres)
- Logging of application events and errors via winston, saved to `logs/` (e.g. `logs/error.log`)
- CORS and HTTPS must be enforced in production

Extra recommendations (not all implemented):

- Use Redis-backed rate limiter for production (distributed)
- Enforce HTTPS via reverse proxy (Nginx or cloud provider)
- Enable email verification and optional 2FA for admins
- Monitor dependencies (`npm audit`, Snyk) and update regularly

## Testing

- Backend unit & integration tests: Jest (run `npm run test` in backend)
- E2E tests: Supertest/Cypress may be used for flows (example scripts in `test/`)
- Security scans: run `npm audit` and consider Snyk/ZAP for vulnerability scanning

## API Endpoints (summary)

> NOTE: This is a high-level summary. See backend controllers for full details.

- `POST /auth/register` — register a new user
- `POST /auth/login` — login, returns `access_token`
- `GET /children` — list children (role-dependent)
- `POST /children` — create child (Parent role)
- `GET /parents/children` — list children for logged-in parent (example)
- `GET /groups` — list groups (admin)
- Additional admin endpoints for managing users & groups

All protected endpoints require `Authorization: Bearer <token>` header.

## Roles and User Flows

- `ADMIN` — manage users, groups, see all data
- `PARENT` — add/view own children
- `CAREGIVER` — view children in assigned group

## Logging & Monitoring

- Winston logger configured in `backend/src/logger/winston-logger.ts` writes to console and files `logs/error.log` and `logs/combined.log`.
- Monitor logs and configure log rotation and secure storage for production.

## Deployment notes (Azure / Docker)

- Build docker images for backend and frontend and push to a registry.
- Use Azure Web App for Containers or Azure Container Instances / AKS for scalable deployment.
- Configure secrets in Azure Key Vault and inject them as environment variables.
- Use Application Gateway or Nginx as reverse proxy and enable HTTPS.

## Troubleshooting

- 401 Unauthorized on API calls: verify token in `localStorage` and that it's sent in `Authorization` header.
- 404 on `/children`: verify correct backend URL and CORS settings.
- Rate limit errors on login: wait for block duration (configurable) or clear limiter in backend.
- DB connection errors: ensure `DATABASE_URL` is correct and Postgres is reachable.

## Further improvements

- Redis-based rate-limiter for distributed environments
- Email verification and password reset flows
- Audit logs for critical actions
- More comprehensive E2E and security tests
