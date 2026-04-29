# Nursery Management System / System Zarządzania Żłobkiem

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![Postgres](https://img.shields.io/badge/Postgres-336791?style=flat&logo=postgresql&logoColor=white)

## About This Project / O projekcie

This is a full-stack childcare management system that demonstrates production-ready patterns in action. It solves a real problem — managing children, staff, attendance and communication in a nursery — while showcasing clean architecture, secure authentication, role-based access control, and scalable design patterns.

To to pełny system zarządzania żłobkiem, który pokazuje production-ready wzorce w praktyce. Rozwiązuje realny problem — zarządzanie dziećmi, personelem, frekwencją i komunikacją — jednocześnie demonstrując czystą architekturę, bezpieczne uwierzytelnianie, kontrolę dostępu opartą na rolach i skalowalne wzorce projektowe.

### Why This Stack? / Dlaczego ten stack?

- **NestJS**: Scalable backend with TypeScript, dependency injection, and TypeORM for clean database access / Skalowalne API z TypeScript, dependency injection i TypeORM do czystego dostępu do danych
- **React + Vite**: Fast, modern UI with Ant Design for polished, accessible components / Szybki, nowoczesny interfejs z Ant Design dla dopracowanych komponentów
- **PostgreSQL**: Reliable relational storage for complex data (children, parents, groups, attendance history) / Niezawodna relacyjna baza danych dla złożonych danych (dzieci, rodzice, grupy, historia frekwencji)
- **JWT + Role-Based Guards**: Secure authentication and authorization without external services / Bezpieczne uwierzytelnianie i autoryzacja bez zewnętrznych usług
- **Docker Compose**: Single-command local setup — reproducible environment for any developer / Jednorazowe uruchomienie środowiska lokalnego — reprodukowalne dla każdego dewelopera

## Table of Contents / Spis treści

- [Highlights / Najważniejsze możliwości](#highlights--najważniejsze-możliwo%C5%9Bci)
- [Tech Stack / Stack technologiczny](#tech-stack--stack-technologiczny)
- [Quick Start / Szybki start](#quick-start--szybki-start)
- [Roles / Role i uprawnienia](#roles-and-responsibilities--role-i-uprawnienia)
- [Demo / Demo](#demo--demo)
- [Screenshots / Zrzuty ekranu](#screenshots--zrzuty-ekranu)
- [API Overview / Przegląd API](#api-overview--przegl%C4%85d-api)
- [Environment / Zmienne środowiskowe](#environment---zmienne-%C5%9Brodowiskowe)
- [Docker Compose / Docker Compose](#docker-compose--docker-compose)
- [Security / Bezpieczeństwo](#security--bezpiecze%C5%84stwo)
- [Troubleshooting / Rozwiązywanie problemów](#troubleshooting--rozwi%C4%85zywanie-problem%C3%B3w)
- [License / Licencja](#license--licencja)


## Highlights / Najważniejsze możliwości

- JWT authentication with access and refresh tokens / Uwierzytelnianie JWT z access i refresh tokenami
- Role-based access for `ADMIN`, `PARENT`, `CAREGIVER` / Role i uprawnienia dla `ADMIN`, `PARENT`, `CAREGIVER`
- Children, groups, parents, and caregivers management / Zarządzanie dziećmi, grupami, rodzicami i opiekunami
- Attendance tracking and history / Ewidencja obecności i historia frekwencji
- System announcements and email notifications / Ogłoszenia systemowe i powiadomienia e-mail
- Internal messaging between users / Wiadomości wewnętrzne między użytkownikami
- Validation, rate limiting, and secure cookies / Walidacja, rate limiting i bezpieczne cookies
- Structured logging with Winston / Ustrukturyzowane logowanie przez Winston

## Tech Stack / Stack technologiczny

- Backend: NestJS, TypeScript, TypeORM, PostgreSQL
- Frontend: React, TypeScript, Vite, Ant Design
- Auth: JWT, guards, role-based access control
- Security: bcrypt, helmet, httpOnly cookies

## Repository Structure / Struktura repozytorium

- `backend/` - NestJS API application / Aplikacja API w NestJS
- `frontend/` - React user interface / Interfejs użytkownika w React
- `docker-compose.yml` - local backend + PostgreSQL setup / lokalne uruchomienie backendu i PostgreSQL
- `README.md` - repository documentation / dokumentacja całego repozytorium

## Requirements / Wymagania

- Node.js 18+ or newer / Node.js 18+ lub nowszy
- npm 10+
- PostgreSQL 13+
- Docker and Docker Compose for containerized runs / Docker i Docker Compose do uruchomienia kontenerowego

## Quick Start / Szybki start

### 1. Clone the repository / Klonowanie repozytorium

```bash
git clone <repo-url>
cd nursery-backend
```

### 2. Backend / Backend

```bash
cd backend
npm install
```

Create `backend/.env` using your local configuration. Example:

Utwórz `backend/.env` zgodnie z własną konfiguracją. Przykład:

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

Uruchom backend:

```bash
npm run start:dev
```

Useful backend scripts / Przydatne skrypty backendu:

```bash
npm run build
npm run start
npm run start:prod
npm run test
npm run test:e2e
npm run typeorm:run
npm run typeorm:revert
```

### 3. Frontend / Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env` / Utwórz `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

Uruchom frontend:

```bash
npm run dev
```

Useful frontend scripts / Przydatne skrypty frontendu:

```bash
npm run build
npm run lint
npm run preview
```

## Docker Compose / Docker Compose

The root `docker-compose.yml` brings up PostgreSQL and the backend. Make sure environment variables are set before starting.

Plik `docker-compose.yml` uruchamia PostgreSQL i backend. Przed startem upewnij się, że masz ustawione zmienne środowiskowe.

```bash
docker compose up --build
```

## Environment Variables / Zmienne środowiskowe

### Backend / Backend

Common variables / Najczęściej używane zmienne:

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

W zależności od wdrożenia mogą być też potrzebne ustawienia SMTP i dodatkowe parametry bezpieczeństwa.

### Frontend / Frontend

```env
VITE_API_URL=http://localhost:3000
```

In the frontend code, this value is read as `import.meta.env.VITE_API_URL`.

W kodzie frontendu wartość ta jest odczytywana jako `import.meta.env.VITE_API_URL`.

## Business Features / Funkcje biznesowe

- user and role management / zarządzanie użytkownikami i rolami
- assigning children to groups / przypisywanie dzieci do grup
- attendance tracking / ewidencja obecności
- announcements for all users or selected groups / ogłoszenia dla wszystkich lub wybranych grup
- internal messaging / wiadomości wewnętrzne
- email notifications / powiadomienia e-mail
- audit logging / logowanie audytowe

## Roles and Responsibilities / Role i uprawnienia

### Administrator / Administrator

Administrator has full access to the system and can manage every major area of the application:

Administrator ma pełny dostęp do systemu i może zarządzać każdym kluczowym obszarem aplikacji:

- create, edit, and delete users / tworzenie, edycja i usuwanie użytkowników
- assign roles and change user permissions / przypisywanie ról i zmiana uprawnień użytkowników
- manage children profiles and their assignments / zarządzanie profilami dzieci i ich przypisaniami
- create and manage groups / tworzenie i zarządzanie grupami
- assign caregivers to groups / przypisywanie opiekunów do grup
- publish global and group-specific announcements / publikowanie ogłoszeń globalnych i grupowych
- view and moderate messages and communication flows / przeglądanie i moderowanie wiadomości oraz komunikacji
- access attendance data and system-wide history / dostęp do danych obecności i historii całego systemu
- review audit logs and security-related events / przeglądanie logów audytowych i zdarzeń bezpieczeństwa
- manage system configuration and operational settings / zarządzanie konfiguracją systemu i ustawieniami operacyjnymi

### Parent / Rodzic

Parent users can only access data connected with their own children and communication related to them:

Użytkownik z rolą rodzica ma dostęp wyłącznie do danych powiązanych z własnymi dziećmi oraz komunikacji z nimi związanej:

- view their own children profiles / przeglądanie profili własnych dzieci
- see attendance history and daily presence information / przeglądanie historii obecności i bieżącej frekwencji
- receive announcements related to their child’s group / odbieranie ogłoszeń związanych z grupą dziecka
- send and receive messages with caregivers and administration / wysyłanie i odbieranie wiadomości od opiekunów i administracji
- update selected personal account details where allowed / aktualizacja wybranych danych konta, jeśli jest to dozwolone
- access notifications and system messages relevant to their child / dostęp do powiadomień i komunikatów dotyczących dziecka

### Caregiver / Opiekun

Caregivers work with assigned groups and children, with access limited to their scope of responsibility:

Opiekun pracuje z przypisanymi grupami i dziećmi, a dostęp jest ograniczony do jego zakresu obowiązków:

- view children assigned to their groups / przeglądanie dzieci przypisanych do swoich grup
- track attendance for children in assigned groups / rejestrowanie obecności dzieci w przypisanych grupach
- view group-related announcements and updates / przeglądanie ogłoszeń i aktualizacji dotyczących grup
- communicate with parents and administrators / komunikacja z rodzicami i administracją
- manage daily operational information for their groups / zarządzanie bieżącymi informacjami operacyjnymi dla grup
- receive notifications about changes in assigned children or groups / otrzymywanie powiadomień o zmianach dotyczących przypisanych dzieci lub grup

## Demo / Demo

(https://www.youtube.com/watch?v=BZzBCshnm1U)

## Screenshots / Zrzuty ekranu

<img width="808" height="790" alt="image" src="https://github.com/user-attachments/assets/84000352-9087-4311-927a-62e3d9f9c0b8" />

<img width="912" height="907" alt="image" src="https://github.com/user-attachments/assets/a0c16fa6-5852-4e27-a847-3b8fa5988715" />

<img width="825" height="930" alt="image" src="https://github.com/user-attachments/assets/7e9cded3-0b58-44fb-94ad-a70902646d46" />

<img width="762" height="694" alt="image" src="https://github.com/user-attachments/assets/a4df2baa-b5f2-4c00-a7ea-5a6d5e219710" />

<img width="977" height="985" alt="image" src="https://github.com/user-attachments/assets/2615355c-f7fa-411f-a69d-388592888967" />

<img width="940" height="935" alt="image" src="https://github.com/user-attachments/assets/5a03bc96-10d5-4c8e-9bbf-3e19e6432683" />

<img width="940" height="456" alt="image" src="https://github.com/user-attachments/assets/4b0a15a4-2369-4ef4-830d-eb2dd0391a1a" />

<img width="940" height="475" alt="image" src="https://github.com/user-attachments/assets/896a3929-ba43-4f36-9889-1b462d0e727b" />

<img width="930" height="438" alt="image" src="https://github.com/user-attachments/assets/bf251e9c-9990-41ce-abdb-88a495112419" />

<img width="961" height="391" alt="image" src="https://github.com/user-attachments/assets/d21430ab-9480-4b85-8984-67a2b8f99bf5" />

<img width="961" height="422" alt="image" src="https://github.com/user-attachments/assets/4e94bf65-a5f3-4a15-890b-9c42f640b57d" />

<img width="874" height="539" alt="image" src="https://github.com/user-attachments/assets/c799bb61-6f69-4d80-87cf-9111ea442792" />

<img width="509" height="964" alt="image" src="https://github.com/user-attachments/assets/aa470100-9046-4880-b63a-8df3356af60d" />

<img width="635" height="1094" alt="image" src="https://github.com/user-attachments/assets/db459b25-4210-4254-81d0-1ab34875723e" />


## API Overview / Przegląd API

Main backend areas / Główne obszary backendu:

- `/auth` - login, registration, token refresh, password reset / logowanie, rejestracja, odświeżanie tokenów, reset hasła
- `/users` - user management / zarządzanie użytkownikami
- `/children` - children and assignments / dzieci i przypisania
- `/groups` - groups and caregiver assignments / grupy i przypisywanie opiekunów
- `/attendance` - attendance and history / obecności i historia
- `/announcements` - announcements / ogłoszenia
- `/messages` - messages / wiadomości
- `/parents` and `/caregivers` - profiles and relations / profile i relacje

The full endpoint list is defined in the backend controllers.

Pełna lista endpointów znajduje się w kontrolerach backendu.

## Security / Bezpieczeństwo

- JWT tokens stored in `httpOnly` cookies / tokeny JWT przechowywane w `httpOnly` cookies
- input validation on backend and frontend / walidacja danych po stronie backendu i frontendu
- password hashing with `bcrypt` / haszowanie haseł przez `bcrypt`
- brute-force protection via rate limiting / ochrona przed brute force przez rate limiting
- security headers via `helmet` / nagłówki bezpieczeństwa przez `helmet`
- role and permission enforcement on the backend / egzekwowanie ról i uprawnień po stronie backendu

## Troubleshooting / Rozwiązywanie problemów

- If the backend does not start, check `backend/.env` and the PostgreSQL connection. / Jeśli backend nie startuje, sprawdź `backend/.env` i połączenie z PostgreSQL.
- If the frontend cannot reach the API, check `VITE_API_URL`. / Jeśli frontend nie widzi API, sprawdź `VITE_API_URL`.
- If TypeScript errors appear, run `npm run build` inside `backend/` and inspect the reported files. / Jeśli pojawiają się błędy TypeScript, uruchom `npm run build` w `backend/` i sprawdź wskazane pliki.
- If Docker Compose fails, make sure ports `3000` and `5432` are free. / Jeśli Docker Compose nie działa, upewnij się, że porty `3000` i `5432` są wolne.
