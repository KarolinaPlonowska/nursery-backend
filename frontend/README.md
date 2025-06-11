# Nursery Management Frontend

This project is a React + Vite + TypeScript + Ant Design frontend for a nursery management system.

## Features

- Secure registration and login (JWT-based, no hardcoded secrets)
- Role-based access: Admin, Parent, Caregiver
- Assigning children to groups
- Modern UI with Ant Design
- Communication with backend via axios

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

- `src/` – React components, pages, API logic
- Uses Ant Design for all UI

## Security

- All authentication is handled via JWT tokens
- No secrets or credentials are hardcoded in the frontend
- Role-based access is enforced in the UI

## Backend

Connects to the existing NestJS backend (see backend/ directory).
