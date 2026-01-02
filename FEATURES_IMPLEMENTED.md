## 🔐 Refresh Tokens, Password Reset & Login Notifications - Wdrożone

### ✅ WDROŻONE FUNKCJONALNOŚCI:

#### 1. **Refresh Tokens (7 dni)** ✓
- **Endpoint**: `POST /auth/refresh-token`
- **Przeznaczenie**: Odświeżanie access_token bez ponownego logowania
- **Implementacja**:
  - Refresh token przechowywany w httpOnly cookie (automatycznie wysyłany)
  - Refresh token ważny 7 dni
  - Access token ważny 1 godzina
  - Haszowane w bazie danych (bcrypt)
  - Zapisywane w User entity (kolumny: `refreshToken`, `refreshTokenExpiresAt`)

**Jak używać**:
```bash
# Login - automatycznie ustawia refresh_token w cookie
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
# Response: { message, user }
# Cookies: access_token (1h), refresh_token (7d)

# Refresh access token
POST /auth/refresh-token
# Body: {} (token będzie z cookies)
# Response: { message, user, access_token }
```

#### 2. **Password Reset Endpoint** ✓
- **Endpoints**:
  - `POST /auth/request-password-reset` - Poproś o reset
  - `POST /auth/reset-password` - Zmień hasło
- **Implementacja**:
  - Generowanie losowego 32-znakowego tokenu
  - Token ważny 1 godzina
  - Haszowany token zapisywany w nowej tabeli `password_resets`
  - Email z linkiem resetowania
  - Potwierdzenie emailem po zmianie hasła
  - Walidacja siły hasła obowiązkowa

**Jak używać**:
```bash
# 1. Poproś o reset
POST /auth/request-password-reset
{
  "email": "user@example.com"
}
# Response: { message: "Jeśli email istnieje, wysłaliśmy link..." }
# Email: https://localhost:5173/reset-password?token=...&email=...

# 2. Resetuj hasło
POST /auth/reset-password
{
  "email": "user@example.com",
  "token": "token_z_emaila",
  "newPassword": "NewSecurePass123!"
}
# Response: { message: "Hasło zostało zmienione pomyślnie" }
# Email potwierdzenia wysłany
```

#### 3. **Login Attempt Notifications** ✓
- **Logowanie**: Wszystkie próby logowania zapisywane w tabeli `login_attempts`
- **Dane logowane**:
  - Email użytkownika
  - IP address
  - Czy udane/nieudane
  - Powód niepowodzenia (dla nieudanych)
  - Timestamp

- **Automatyczne notyfikacje emailem**:
  - Wysyła email gdy logowanie z **nowego IP**
  - Email zawiera: IP, czas, link do zabezpieczenia konta
  - Tylko dla udanych logowań

**Przepływ**:
```
Login attempt → Zapis w bazie (success, IP, timestamp)
              ↓
         Jeśli success AND nowy IP
              ↓
    Wyślij email powiadomienia
```

**Email zawiera**:
```
Szczegóły logowania:
📍 IP: 192.168.1.100
⏰ Czas: 29.12.2025 14:50:00

⚠️ Jeśli to nie byłeś Ty, zabezpiecz swoje konto [LINK]
```

---

### 📊 BAZY DANYCH - NOWE TABELE:

#### 1. `password_resets`
```sql
- id (UUID) - Primary Key
- email (string) - Unique
- token (string) - Haszowany token
- expiresAt (Date) - 1 godzina
- used (boolean) - Czy już użyty
- createdAt (Date) - Timestamp
```

#### 2. `login_attempts`
```sql
- id (UUID) - Primary Key
- email (string) - Email użytkownika
- ipAddress (string) - IP logowania
- success (boolean) - Udane/nieudane
- failureReason (string) - Powód niepowodzenia (optional)
- attemptedAt (Date) - Timestamp
```

#### 3. `users` - ZMODYFIKOWANA
```sql
Dodane kolumny:
- refreshToken (string) - Haszowany refresh token
- refreshTokenExpiresAt (Date) - Wygasa za 7 dni
```

---

### 🔧 ZMIENIONE PLIKI:

**Backend:**
1. ✅ `src/auth/entities/password-reset.entity.ts` - NEW
2. ✅ `src/auth/entities/login-attempt.entity.ts` - NEW
3. ✅ `src/auth/auth.service.ts` - Login tracking, refresh, password reset
4. ✅ `src/auth/auth.controller.ts` - 3 nowe endpointy, logowanie
5. ✅ `src/auth/auth.module.ts` - Nowe encje w TypeOrmModule
6. ✅ `src/auth/services/email.service.ts` - 2 nowe metody email
7. ✅ `src/users/user.entity.ts` - Refresh token kolumny
8. ✅ `src/users/users.service.ts` - Refresh token management

**Frontend:**
- Będzie potrzebować update Loginpage do obsługi refresh tokena
- Będzie potrzebować reset password page

---

### 📝 NOWE ENDPOINTY:

| Endpoint | Metoda | Opis | Auth |
|----------|--------|------|------|
| `/auth/refresh-token` | POST | Odśwież access token | Refresh token |
| `/auth/request-password-reset` | POST | Poproś o reset | ❌ |
| `/auth/reset-password` | POST | Zmień hasło | Token |
| `/auth/logout` | POST | ZMIENIONY - teraz czyści oba tokeny | ✅ JWT |

---

### 🎯 FLOW LOGOWANIA Z REFRESH TOKEN:

```
1. Login
   POST /auth/login → cookies: access_token (1h), refresh_token (7d)

2. Po 1 godzinie access_token wygasa
   Frontend dostaje 401 Unauthorized

3. Frontend automatycznie odświeża
   POST /auth/refresh-token (z refresh_token z cookies)
   → Nowy access_token bez ponownego logowania

4. Po 7 dniach refresh_token wygasa
   → Konieczne ponowne logowanie

5. Logout
   POST /auth/logout → Czyści oba tokeny i bazę danych
```

---

### 🔒 BEZPIECZEŃSTWO:

✅ Tokeny przechowywane w httpOnly cookies (XSS proof)  
✅ Refresh token haszowany w bazie (bcrypt)  
✅ Token refresh ważny 7 dni (dłużej niż access)  
✅ IP tracking dla notyfikacji logowania  
✅ Password reset token ważny 1 godzinę  
✅ Walidacja siły hasła na resecie  
✅ Email potwierdzenie po resecie  

---

### 📋 TODO - FRONTEND:

Frontend będzie potrzebować:
- [ ] Auto-refresh access_token gdy wyginie
- [ ] Login attempt history page
- [ ] Password reset page `/reset-password`
- [ ] Login notifications modal
- [ ] Device management (historia logowań)

---

### ✨ STATUS:

✅ Backend: **GOTOWY**
✅ Build: **PRZESZEDŁ**  
✅ Endpointy: **ZAREJESTROWANE** (widoczne w logs)
⏳ Database migrations: **POTRZEBNE** (dodaj migrations)
⏳ Frontend: **DO ZROBIENIA**

---

**Data wdrożenia**: 29 grudnia 2025  
**Status**: ✅ WDROŻONE I TESTOWALNE PRZEZ API
