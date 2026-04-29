# 🏫 System Zarządzania Żłobkiem - Backend API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

## 📋 Opis

Profesjonalne **API Systemu Zarządzania Żłobkiem** zbudowane w NestJS, TypeScript i PostgreSQL. System zapewnia kompleksową funkcjonalność do zarządzania operacjami żłobka, w tym zarządzanie użytkownikami, opieką nad dziećmi, śledzeniem frekwencji i bezpieczną komunikacją między rodzicami, opiekunami i administratorami.

### 🌟 Kluczowe Funkcjonalności

- **👥 Zarządzanie Użytkownikami Multi-Role** - Role Admin, Rodzic, Opiekun z określonymi uprawnieniami
- **🔐 Zaawansowana Autentykacja** - Tokeny JWT z rotacją refresh tokenów, reset haseł, powiadomienia o logowaniu
- **👶 Zarządzanie Dziećmi** - Kompletne profile dzieci, informacje medyczne, kontakty awaryjne
- **👨‍👩‍👧‍👦 Zarządzanie Rodzicami i Opiekunami** - Wszechstronne profile użytkowników i relacje
- **📚 Zarządzanie Grupami** - Organizacja dzieci w grupy z przypisanymi opiekunami
- **📊 Śledzenie Frekwencji** - Frekwencja w czasie rzeczywistym z funkcjami check-in/check-out
- **📢 Ogłoszenia** - Powiadomienia i aktualizacje w całym systemie
- **💬 Bezpieczne Wiadomości** - Komunikacja między użytkownikami z dostępem opartym na rolach
- **🔍 Logowanie Audytu** - Kompletny ślad audytu dla wszystkich działań systemowych
- **🛡️ Funkcje Bezpieczeństwa** - Ograniczenia częstości, walidacja danych wejściowych, bezpieczne zasady haseł

## 🛠️ Stack Technologiczny

- **Framework**: NestJS 11.x z TypeScript
- **Baza danych**: PostgreSQL z TypeORM
- **Autentykacja**: JWT z rotacją refresh tokenów
- **Bezpieczeństwo**: bcrypt, helmet, ograniczenia częstości
- **Walidacja**: class-validator & class-transformer  
- **Email**: Nodemailer do powiadomień
- **Logowanie**: Integracja z Winston logger
- **Testowanie**: Jest dla testów jednostkowych i E2E

## 🚀 Szybki Start

### Wymagania Wstępne

- **Node.js** (v18 lub wyższy)
- **PostgreSQL** (v13 lub wyższy)
- **npm** lub **yarn**

### Konfiguracja Środowiska

1. **Sklonuj repozytorium**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Zainstaluj zależności**
   ```bash
   npm install
   ```

3. **Skonfiguruj zmienne środowiskowe**
   
   Utwórz plik `.env` w katalogu backend:
   ```env
   # Baza danych
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=twoj_uzytkownik_db
   DATABASE_PASSWORD=twoje_haslo_db
   DATABASE_NAME=nursery_db
   
   # Konfiguracja JWT
   JWT_ACCESS_SECRET=twoj-super-tajny-klucz-dostepu
   JWT_REFRESH_SECRET=twoj-super-tajny-klucz-refresh
   JWT_ACCESS_EXPIRATION=1h
   JWT_REFRESH_EXPIRATION=7d
   
   # Konfiguracja Email
   SMTP_HOST=twoj-host-smtp
   SMTP_PORT=587
   SMTP_USER=twoj-email@domena.com
   SMTP_PASS=twoje-haslo-email
   
   # Aplikacja
   PORT=3000
   NODE_ENV=development
   ```

4. **Konfiguracja bazy danych**
   ```bash
   # Uruchom migracje
   npm run typeorm:run
   ```

### Uruchamianie Aplikacji

```bash
# Tryb development z hot reload
npm run start:dev

# Tryb produkcyjny
npm run start:prod

# Tryb debug
npm run start:debug
```

API będzie dostępne pod adresem `http://localhost:3000`

## 📡 Przegląd Endpointów API

### 🔐 Autentykacja i Użytkownicy
- `POST /auth/register` - Rejestracja użytkownika
- `POST /auth/login` - Logowanie użytkownika (ustawia httpOnly cookies)
- `POST /auth/refresh-token` - Odświeżanie access tokenu
- `POST /auth/request-password-reset` - Żądanie resetu hasła
- `POST /auth/reset-password` - Reset hasła z tokenem
- `POST /auth/logout` - Wylogowanie użytkownika
- `GET /users/profile` - Pobranie profilu aktualnego użytkownika
- `PUT /users/profile` - Aktualizacja profilu użytkownika

### 👶 Zarządzanie Dziećmi
- `GET /children` - Lista wszystkich dzieci (filtrowana według roli)
- `POST /children` - Tworzenie nowego rekordu dziecka
- `GET /children/:id` - Szczegóły dziecka
- `PUT /children/:id` - Aktualizacja informacji o dziecku
- `DELETE /children/:id` - Usunięcie rekordu dziecka

### 👨‍👩‍👧‍👦 Zarządzanie Rodzicami
- `GET /parents` - Lista wszystkich rodziców
- `POST /parents` - Tworzenie profilu rodzica
- `GET /parents/:id` - Szczegóły rodzica
- `PUT /parents/:id` - Aktualizacja informacji o rodzicu
- `GET /parents/:id/children` - Pobranie dzieci rodzica

### 👨‍🏫 Zarządzanie Opiekunami
- `GET /caregivers` - Lista wszystkich opiekunów
- `POST /caregivers` - Tworzenie profilu opiekuna
- `GET /caregivers/:id` - Szczegóły opiekuna
- `PUT /caregivers/:id` - Aktualizacja informacji o opiekunie
- `GET /caregivers/:id/groups` - Pobranie grup przypisanych do opiekuna

### 📚 Zarządzanie Grupami
- `GET /groups` - Lista wszystkich grup
- `POST /groups` - Tworzenie nowej grupy
- `GET /groups/:id` - Szczegóły grupy
- `PUT /groups/:id` - Aktualizacja informacji o grupie
- `POST /groups/:id/children` - Dodawanie dzieci do grupy
- `DELETE /groups/:id/children/:childId` - Usuwanie dziecka z grupy

### 📊 Śledzenie Frekwencji
- `GET /attendance` - Pobranie rekordów frekwencji
- `POST /attendance/check-in` - Zameldowanie dziecka
- `POST /attendance/check-out` - Wymeldowanie dziecka  
- `GET /attendance/today` - Dzisiejsza frekwencja
- `GET /attendance/child/:id` - Historia frekwencji dziecka

### 📢 Ogłoszenia
- `GET /announcements` - Lista ogłoszeń
- `POST /announcements` - Tworzenie ogłoszenia (tylko Admin)
- `PUT /announcements/:id` - Aktualizacja ogłoszenia
- `DELETE /announcements/:id` - Usuwanie ogłoszenia

### 💬 Wiadomości
- `GET /messages` - Pobranie wiadomości użytkownika
- `POST /messages` - Wysyłanie wiadomości
- `GET /messages/:id` - Szczegóły wiadomości
- `PUT /messages/:id/read` - Oznaczanie wiadomości jako przeczytanej

## 🔒 Autentykacja i Autoryzacja

### System Tokenów JWT

System używa podejścia z podwójnymi tokenami:

1. **Access Token** (1 godzina) - Do zapytań API
2. **Refresh Token** (7 dni) - Do odnawiania tokenów

Oba tokeny są przechowywane w httpOnly cookies dla bezpieczeństwa.

### Role Użytkowników i Uprawnienia

- **Admin** 👑
  - Pełny dostęp do systemu
  - Zarządzanie użytkownikami
  - Konfiguracja systemu
  - Wszystkie operacje CRUD

- **Opiekun** 👨‍🏫  
  - Zarządzanie przypisanymi grupami i dziećmi
  - Rejestrowanie frekwencji
  - Wysyłanie/odbieranie wiadomości
  - Przeglądanie ogłoszeń

- **Rodzic** 👨‍👩‍👧‍👦
  - Przeglądanie informacji o własnych dzieciach
  - Przeglądanie rekordów frekwencji
  - Odbieranie ogłoszeń
  - Komunikacja z opiekunami

### Przykład Użycia

```bash
# 1. Zarejestruj użytkownika
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rodzic@example.com",
    "password": "BezpieczneHaslo123!",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "role": "parent"
  }'

# 2. Zaloguj się (cookies zostaną ustawione automatycznie)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "rodzic@example.com",
    "password": "BezpieczneHaslo123!"
  }'

# 3. Dostęp do chronionego endpointa
curl -X GET http://localhost:3000/children \
  -b cookies.txt
```

## 🧪 Testowanie

### Testy Jednostkowe
```bash
# Uruchom testy jednostkowe
npm run test

# Uruchom testy w trybie watch
npm run test:watch

# Generuj raport pokrycia
npm run test:cov
```

### Testy End-to-End
```bash
# Uruchom testy E2E
npm run test:e2e
```

### Pokrycie Testów
Projekt dąży do >80% pokrycia testów we wszystkich modułach.

## 📁 Struktura Projektu

```
src/
├── announcements/          # Zarządzanie ogłoszeniami
├── attendance/            # System śledzenia frekwencji
├── audit/                # Funkcjonalność logowania audytu
├── auth/                 # Autentykacja i autoryzacja
│   ├── guards/           # Guardy JWT, guardy ról
│   ├── strategies/       # Strategia Passport JWT
│   └── services/         # Serwis auth, ograniczanie częstości
├── caregivers/           # Zarządzanie opiekunami
├── children/             # Zarządzanie dziećmi
├── config/               # Konfiguracja bazy danych i aplikacji
├── groups/               # Zarządzanie grupami
├── logger/               # Konfiguracja Winston logger
├── messages/             # System wiadomości
├── migrations/           # Migracje bazy danych
├── parents/              # Zarządzanie rodzicami
└── users/                # Zarządzanie użytkownikami
```

## 🛡️ Funkcje Bezpieczeństwa

- **Bezpieczeństwo Haseł**: Haszowanie bcrypt z salt rounds
- **Ograniczenie Częstości**: Endpointy auth chronione przed atakami brute force
- **Walidacja Danych Wejściowych**: Kompleksowa walidacja DTO
- **Ochrona przed SQL Injection**: Query builder TypeORM
- **Ochrona XSS**: Middleware Helmet
- **Konfiguracja CORS**: Konfigurowalne zapytania cross-origin
- **Bezpieczne Cookies**: httpOnly cookies do przechowywania tokenów

## 🐳 Migracje Bazy Danych

```bash
# Wygeneruj nową migrację
npm run typeorm:migrate -- src/migrations/NazwaMigracji

# Uruchom oczekujące migracje
npm run typeorm:run

# Cofnij ostatnią migrację
npm run typeorm:revert
```

## 🔧 Skrypty Deweloperskie

```bash
# Development
npm run start:dev          # Start z hot reload
npm run start:debug        # Start z debuggerem

# Budowanie
npm run build              # Buduj dla produkcji
npm run build:debug        # Buduj z verbose output

# Jakość Kodu
npm run lint               # Uruchom ESLint
npm run format             # Formatuj kod z Prettier

# Baza Danych
npm run migration:run      # Uruchom migracje
npm run migration:revert   # Cofnij migracje
```

## 📊 Logowanie i Monitorowanie

Aplikacja używa Winston do ustrukturyzowanego logowania:

- **Poziomy Logów**: error, warn, info, debug
- **Rotacja Logów**: Dzienna rotacja z kompresją
- **Format Strukturalny**: Formatowanie JSON dla produkcji
- **Logowanie Zapytań**: Automatyczne logowanie zapytań HTTP

Pliki logów są przechowywane w katalogu `logs/`.

## 🚀 Deployment

### Wymagania Środowiskowe
- Node.js 18+
- PostgreSQL 13+
- Redis (opcjonalnie, do przechowywania sesji)

### Zmienne Środowiskowe Produkcyjne
```env
NODE_ENV=production
DATABASE_SSL=true
JWT_ACCESS_SECRET=silny-produkcyjny-sekret
JWT_REFRESH_SECRET=inny-silny-sekret
SMTP_HOST=produkcyjny-host-smtp
```

### Wsparcie Dockera
Aplikacja zawiera wsparcie Dockera. Zobacz główny `docker-compose.yml` dla pełnej konfiguracji.

## 🤝 Kontrybuowanie

1. Forkuj repozytorium
2. Utwórz branch funkcjonalności: `git checkout -b feature/nowa-funkcjonalosc`
3. Commituj zmiany: `git commit -am 'Dodaj nową funkcjonalność'`
4. Wyślij do brancha: `git push origin feature/nowa-funkcjonalosc`
5. Wyślij Pull Request

## 📝 Dokumentacja API

Dla szczegółowej dokumentacji API włącznie ze schematami request/response, użyj narzędzi takich jak:
- **Kolekcja Postman**: Zaimportuj kolekcję do testowania
- **Swagger/OpenAPI**: (Może być dodane z `@nestjs/swagger`)

## 🆘 Rozwiązywanie Problemów

### Częste Problemy

**Nieudane Połączenie z Bazą Danych**
- Sprawdź czy PostgreSQL jest uruchomiony
- Sprawdź dane uwierzytelniające bazy w `.env`
- Upewnij się, że baza danych istnieje

**Błędy Tokenów JWT**
- Sprawdź czy sekrety JWT są ustawione
- Sprawdź ustawienia wygaśnięcia tokenów
- Wyczyść cookies przeglądarki i zaloguj się ponownie

**Błędy Migracji** 
- Upewnij się, że schemat bazy danych jest aktualny
- Sprawdź pliki migracji pod kątem konfliktów
- Sprawdź konfigurację TypeORM

## 📞 Wsparcie

Dla wsparcia technicznego i pytań:
- Utwórz issue w repozytorium
- Sprawdź istniejącą dokumentację
- Przejrzyj logi błędów w katalogu `logs/`

---

Zbudowane z ❤️ używając NestJS i TypeScript
