# Nursery Management System

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![Postgres](https://img.shields.io/badge/Postgres-336791?style=flat&logo=postgresql&logoColor=white)

## About This Project
This is a full-stack childcare management system that demonstrates production-ready patterns in action. It solves a real problem — managing children, staff, attendance and communication in a nursery — while showcasing clean architecture, secure authentication, role-based access control, and scalable design patterns.

### Why This Stack?

- **NestJS**: Scalable backend with TypeScript, dependency injection, and TypeORM for clean database access
- **React + Vite**: Fast, modern UI with Ant Design for polished, accessible components
- **PostgreSQL**: Reliable relational storage for complex data (children, parents, groups, attendance history)
- **JWT + Role-Based Guards**: Secure authentication and authorization without external services
- **Docker Compose**: Single-command local setup — reproducible environment for any developer

## Table of Contents / Spis treści

- [Highlights](#highlights--najważniejsze-możliwo%C5%9Bci)
- [Tech Stack](#tech-stack--stack-technologiczny)
- [Quick Start](#quick-start--szybki-start)
- [Roles](#roles-and-responsibilities--role-i-uprawnienia)
- [Demo](#demo--demo)
- [Screenshots](#screenshots--zrzuty-ekranu)
- [API Overview](#api-overview--przegl%C4%85d-api)
- [Environment](#environment---zmienne-%C5%9Brodowiskowe)
- [Docker Compose](#docker-compose--docker-compose)
- [Security](#security--bezpiecze%C5%84stwo)
- [Troubleshooting](#troubleshooting--rozwi%C4%85zywanie-problem%C3%B3w)


## Highlights

- JWT authentication with access and refresh tokens
- Role-based access for `ADMIN`, `PARENT`, `CAREGIVER`
- Children, groups, parents, and caregivers management
- Attendance tracking and history
- System announcements and email notifications
- Internal messaging between users
- Validation, rate limiting, and secure cookies
- Structured logging with Winston


## Tech Stack

- Backend: NestJS, TypeScript, TypeORM, PostgreSQL
- Frontend: React, TypeScript, Vite, Ant Design
- Auth: JWT, guards, role-based access control
- Security: bcrypt, helmet, httpOnly cookies

## Repository Structure

- `backend/` - NestJS API application
- `frontend/` - React user interface
- `docker-compose.yml` - local backend + PostgreSQL setup
- `README.md` - repository documentation

## Requirements

- Node.js 18+ or newer
- npm 10+
- PostgreSQL 13+
- Docker and Docker Compose for containerized runs

## Quick Start

### 1. Clone the repository

```bash
git clone <repo-url>
cd nursery-backend
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env` using your local configuration. Example:

```env
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_NAME=nursery
JWT_ACCESS_SECRET=replace-with-secure-secret
JWT_REFRESH_SECRET=replace-with-secure-secret
```

Start the backend:

```bash
npm run start:dev
```

Useful backend scripts:

```bash
npm run build
npm run start
npm run start:prod
npm run test
npm run test:e2e
npm run typeorm:run
npm run typeorm:revert
```

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Useful frontend scripts:

```bash
npm run build
npm run lint
npm run preview
```

## Docker Compose

The root `docker-compose.yml` brings up PostgreSQL and the backend. Make sure environment variables are set before starting.

```bash
docker compose up --build
```

## Environment Variables

### Backend

Common variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_NAME=nursery
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

Depending on the deployment, SMTP settings and additional security values may also be required.

### Frontend

```env
VITE_API_URL=http://localhost:3000
```

In the frontend code, this value is read as `import.meta.env.VITE_API_URL`.

## Business Features

- user and role management
- assigning children to groups
- attendance tracking
- announcements for all users or selected groups
- internal messaging
- email notifications
- audit logging

## Roles and Responsibilities

### Administrator

Administrator has full access to the system and can manage every major area of the application:

- create, edit, and delete users
- assign roles and change user permissions
- manage children profiles and their assignments 
- create and manage groups
- assign caregivers to groups
- publish global and group-specific announcements
- view and moderate messages and communication flows
- access attendance data and system-wide history
- review audit logs and security-related events
- manage system configuration and operational settings

### Parent

Parent users can only access data connected with their own children and communication related to them:

- view their own children profiles
- see attendance history and daily presence information 
- receive announcements related to their child’s group
- send and receive messages with caregivers and administration
- update selected personal account details where allowed 
- access notifications and system messages relevant to their child

### Caregiver

Caregivers work with assigned groups and children, with access limited to their scope of responsibility:

- view children assigned to their groups
- track attendance for children in assigned groups 
- view group-related announcements and updates
- communicate with parents and administrators
- manage daily operational information for their groups 
- receive notifications about changes in assigned children or groups 

## Demo

(https://www.youtube.com/watch?v=BZzBCshnm1U)

## Screenshots
<br>
<img width="808" height="790" alt="image" src="https://github.com/user-attachments/assets/84000352-9087-4311-927a-62e3d9f9c0b8" />
<br>
<img width="912" height="907" alt="image" src="https://github.com/user-attachments/assets/a0c16fa6-5852-4e27-a847-3b8fa5988715" />
<br>
<img width="825" height="930" alt="image" src="https://github.com/user-attachments/assets/7e9cded3-0b58-44fb-94ad-a70902646d46" />
<br>
<img width="762" height="694" alt="image" src="https://github.com/user-attachments/assets/a4df2baa-b5f2-4c00-a7ea-5a6d5e219710" />
<br>
<img width="977" height="985" alt="image" src="https://github.com/user-attachments/assets/2615355c-f7fa-411f-a69d-388592888967" />
<br>
<img width="940" height="935" alt="image" src="https://github.com/user-attachments/assets/5a03bc96-10d5-4c8e-9bbf-3e19e6432683" />
<br>
<img width="940" height="456" alt="image" src="https://github.com/user-attachments/assets/4b0a15a4-2369-4ef4-830d-eb2dd0391a1a" />
<br>
<img width="940" height="475" alt="image" src="https://github.com/user-attachments/assets/896a3929-ba43-4f36-9889-1b462d0e727b" />
<br>
<img width="930" height="438" alt="image" src="https://github.com/user-attachments/assets/bf251e9c-9990-41ce-abdb-88a495112419" />
<br>
<img width="961" height="391" alt="image" src="https://github.com/user-attachments/assets/d21430ab-9480-4b85-8984-67a2b8f99bf5" />
<br>
<img width="961" height="422" alt="image" src="https://github.com/user-attachments/assets/4e94bf65-a5f3-4a15-890b-9c42f640b57d" />
<br>
<img width="874" height="539" alt="image" src="https://github.com/user-attachments/assets/c799bb61-6f69-4d80-87cf-9111ea442792" />
<br>
<img width="509" height="964" alt="image" src="https://github.com/user-attachments/assets/aa470100-9046-4880-b63a-8df3356af60d" />
<br>
<img width="635" height="1094" alt="image" src="https://github.com/user-attachments/assets/db459b25-4210-4254-81d0-1ab34875723e" />
<br>

## API Overview

Main backend areas:

- `/auth` - login, registration, token refresh, password reset
- `/users` - user management
- `/children` - children and assignments
- `/groups` - groups and caregiver assignments
- `/attendance` - attendance and history
- `/announcements` - announcements
- `/messages` - messages
- `/parents` and `/caregivers` - profiles and relations

The full endpoint list is defined in the backend controllers.

## Security

- JWT tokens stored in `httpOnly` cookies
- input validation on backend and frontend
- password hashing with `bcrypt`
- brute-force protection via rate limiting
- security headers via `helmet`
- role and permission enforcement on the backend

## Troubleshooting

- If the backend does not start, check `backend/.env` and the PostgreSQL connection.
- If the frontend cannot reach the API, check `VITE_API_URL`.
- If TypeScript errors appear, run `npm run build` inside `backend/` and inspect the reported files.
- If Docker Compose fails, make sure ports `3000` and `5432` are free.
