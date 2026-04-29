## 📋 Opis

Nowoczesny **frontend aplikacji systemu zarządzania żłobkiem** zbudowany w React, TypeScript i Ant Design. Aplikacja zapewnia intuicyjny i bezpieczny interfejs użytkownika dla zarządzania operacjami żłobka, z pełnym wsparciem dla ról użytkowników i responsywnym designem.

### 🌟 Kluczowe Funkcjonalności

- **🔐 Bezpieczna Autentykacja** - JWT z refresh tokenami, httpOnly cookies
- **👥 System Ról** - Różne interfejsy dla Admin, Opiekun, Rodzic
- **👶 Zarządzanie Dziećmi** - Kompletne profile z informacjami medycznymi
- **📚 Zarządzanie Grupami** - Organizacja dzieci w grupy z wizualizacją
- **📊 Śledzenie Frekwencji** - Interaktywne check-in/check-out z historią
- **📢 System Ogłoszeń** - Powiadomienia i komunikaty w czasie rzeczywistym  
- **💬 Bezpieczne Wiadomości** - Komunikacja między użytkownikami
- **📱 Responsywny Design** - Optymalizacja dla urządzeń mobilnych i desktop
- **🌐 Polski Interface** - Pełna lokalizacja w języku polskim

## 🛠️ Stack Technologiczny

- **Framework**: React 18 z Hooks
- **Build Tool**: Vite 5 (super szybki HMR)
- **Język**: TypeScript (strict mode)
- **UI Library**: Ant Design 5.x
- **HTTP Client**: Axios z interceptorami
- **State Management**: React Context + useState/useEffect
- **Routing**: React Router 6 (protected routes)
- **Stylowanie**: CSS Modules + Ant Design theming
- **Formatowanie**: Prettier + ESLint
- **Deployment**: Static build optimized

## 🚀 Szybki Start

### Wymagania Wstępne

- **Node.js** (v18 lub wyższy)
- **npm** lub **yarn** 
- **Backend API** działający na porcie 3000

### Instalacja i Uruchomienie

1. **Sklonuj repozytorium**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Zainstaluj zależności**
   ```bash
   npm install
   ```

3. **Skonfiguruj zmienne środowiskowe**
   
   Utwórz plik `.env` w katalogu frontend:
   ```env

   # API Configuration
   VITE_API_BASE_URL=http://localhost:3000
   VITE_APP_TITLE="System Zarządzania Żłobkiem"
   
   # Environment
   VITE_NODE_ENV=development
   ```

4. **Uruchom aplikację**
   ```bash
   # Development server z hot reload
   npm run dev
   
   # Preview production build
   npm run preview
   ```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

## 📁 Struktura Projektu

```
src/
├── components/           # Komponenty wielokrotnego użytku
│   ├── auth/            # Komponenty autentykacji
│   ├── children/        # Komponenty dzieci
│   ├── groups/          # Komponenty grup
│   ├── layout/          # Layout i nawigacja
│   ├── messages/        # System wiadomości
│   └── ui/              # Podstawowe komponenty UI
├── views/               # Główne widoki/strony
│   ├── Login/           # Strona logowania
│   ├── Dashboard/       # Dashboard dla ról
│   ├── Children/        # Zarządzanie dziećmi
│   ├── Groups/          # Zarządzanie grupami
│   ├── Attendance/      # Frekwencja dzieci
│   └── Messages/        # Komunikacja
├── contexts/            # React Context providers
│   ├── AuthContext.tsx # Kontekst autentykacji
│   └── ThemeContext.tsx # Kontekst motywu
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Hook autentykacji
│   ├── useApi.ts        # Hook dla API calls
│   └── useLocalStorage.ts # Hook local storage
├── utils/               # Funkcje pomocnicze
│   ├── api.ts           # Konfiguracja Axios
│   ├── auth.ts          # Utilities autentykacji
│   ├── validation.ts    # Walidatory formularzy
│   └── constants.ts     # Stałe aplikacji
└── assets/              # Zasoby statyczne
    ├── images/
    └── styles/
```

## 👥 Interfejs Użytkownika i Role

### 👑 Panel Administratora
- **Zarządzanie użytkownikami**: Tworzenie, edycja, usuwanie kont
- **Konfiguracja systemu**: Ustawienia żłobka, grupy, ogłoszenia
- **Raporty i statystyki**: Pełna analityka frekwencji i aktywności
- **Audit log**: Historia wszystkich działań w systemie

### 👨‍🏫 Panel Opiekuna
- **Grupy dzieciom**: Zarządzanie przypisanymi grupami
- **Frekwencja**: Check-in/check-out dzieci z QR kodami
- **Profile dzieci**: Przeglądanie informacji medycznych i kontaktów
- **Komunikacja**: Wiadomości do rodziców i administracji
- **Ogłoszenia**: Publikowanie informacji dla rodziców

### 👨‍👩‍👧‍👦 Panel Rodzica
- **Moje dzieci**: Pełne profile własnych dzieci
- **Historia frekwencji**: Detailowe raporty obecności
- **Wiadomości**: Komunikacja z opiekunami
- **Ogłoszenia**: Otrzymywanie powiadomień z żłobka
- **Galeria**: Zdjęcia i wydarzenia z grup dzieci

## 🔐 Przepływ Autentykacji

### System Tokenów
```typescript
// Access Token (1h) + Refresh Token (7d) w httpOnly cookies
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'admin' | 'caregiver' | 'parent' | null;
}

// Automatyczne odświeżanie tokenów
const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  
  useEffect(() => {
    // Auto-refresh logic
    const interval = setInterval(refreshToken, 50 * 60 * 1000); // 50min
    return () => clearInterval(interval);
  }, []);
};
```

### Protected Routes
```typescript
// Trasy chronione z kontrolą ról
<Route path="/admin" element={
  <RequireAuth allowedRoles={['admin']}>
    <AdminDashboard />
  </RequireAuth>
} />

<Route path="/caregiver" element={
  <RequireAuth allowedRoles={['admin', 'caregiver']}>
    <CaregiverDashboard />
  </RequireAuth>
} />
```

## 🚀 Dostępne Skrypty

```bash
# Development
npm run dev              # Uruchom development server (port 5173)
npm run dev:host         # Dostęp z sieci lokalnej (--host)

# Building
npm run build            # Build produkcyjny do /dist
npm run preview          # Preview buildu produkcyjnego

# Code Quality
npm run lint             # Uruchom ESLint
npm run lint:fix         # Napraw automatycznie błędy ESLint
npm run format           # Formatuj kod z Prettier
npm run type-check       # Sprawdź typy TypeScript

## 🔌 Integracja z API

### Konfiguracja Axios
```typescript
// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true, // httpOnly cookies
  timeout: 10000,
});

// Request interceptor dla error handling
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor dla token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Spróbuj odświeżyć token
      await refreshToken();
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Przykłady Użycia API
```typescript
// Hook dla dzieci
const useChildren = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    try {
      const response = await api.get('/children');
      setChildren(response.data);
    } catch (error) {
      message.error('Błąd ładowania listy dzieci');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChildren(); }, []);
  return { children, loading, refetch: fetchChildren };
};
```

## 🛡️ Funkcje Bezpieczeństwa

### Autentykacja
- **JWT Tokens**: Access (1h) + Refresh (7d) w httpOnly cookies
- **Auto-refresh**: Automatyczne odświeżanie przed wygaśnięciem
- **Logout**: Czyszczenie tokenów i przekierowanie
- **Session timeout**: Automatyczne wylogowanie po braku aktywności

### Autoryzacja
- **Role-based UI**: Komponenty ukrywane na podstawie ról
- **Protected Routes**: Guard routes z kontrolą uprawnień
- **API Security**: Wszystkie zapytania z credentials
- **Input Validation**: Walidacja formularzy po stronie klienta

### Best Practices
```typescript
// 1. NIGDY nie przechowuj haseł w localStorage/sessionStorage
// 2. Zawsze waliduj input użytkownika
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 3. Sanitize display data
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

// 4. Role-based rendering
{user?.role === 'admin' && <AdminPanel />}
{['admin', 'caregiver'].includes(user?.role) && <CaregiverTools />}
```

## 📱 Responsive Design

### Breakpoints (Ant Design)
- **xs**: <576px (telefony)
- **sm**: ≥576px (duże telefony)
- **md**: ≥768px (tablety)
- **lg**: ≥992px (desktop)
- **xl**: ≥1200px (duże ekrany)
- **xxl**: ≥1600px (bardzo duże ekrany)

### Mobile-First Approach
```typescript
// Responsywne komponenty
<Row gutter={[16, 16]}>
  <Col xs={24} md={12} lg={8}>
    <ChildCard child={child} />
  </Col>
</Row>

// Adaptive navigation
const isMobile = useMediaQuery('(max-width: 768px)');
{isMobile ? <MobileMenu /> : <DesktopMenu />}
```

## 🎨 Stylowanie i Theming

### Ant Design Customization
```typescript
// src/theme.ts
import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    // Kolory główne żłobka
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    
    // Typografia
    fontFamily: '"Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    
    // Spacing
    borderRadius: 6,
  },
  components: {
    Button: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    },
  },
};
```

### CSS Modules
```css
/* ChildCard.module.css */
.childCard {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.childCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

## 🚦 Development Workflow

### Git Workflow
```bash
# 1. Utwórz branch dla nowej funkcjonalności
git checkout -b feature/dodaj-notyfikacje

# 2. Commituj zmiany z opisowymi wiadomościami
git commit -m "feat: dodaj system powiadomień push"

# 3. Wyślij branch i utwórz PR
git push origin feature/dodaj-notifikacje
```

### Code Quality Standards
- **ESLint**: Linting rules dla TypeScript + React
- **Prettier**: Automatyczne formatowanie kodu
- **TypeScript**: Strict mode, no `any` types
- **Component naming**: PascalCase dla komponentów
- **File naming**: camelCase dla plików, PascalCase dla komponentów

## 🏗️ Build i Deployment

### Production Build
```bash
# Build dla produkcji
npm run build

# Struktura /dist
dist/
├── index.html
├── assets/
│   ├── index-hash.js    # Main bundle
│   ├── index-hash.css   # Styles
│   └── vendor-hash.js   # Dependencies
└── favicon.ico
```

### Environment Variables
```env
# Production
VITE_API_BASE_URL=https://api.zlubusystem.pl
VITE_APP_TITLE="System Zarządzania Żłobkiem"
VITE_NODE_ENV=production
```

## 🆘 Troubleshooting

### Częste Problemy

**Błąd CORS przy API calls**
- Sprawdź czy backend ma skonfigurowany CORS
- Upewnij się że `withCredentials: true` w Axios
- Zweryfikuj `VITE_API_BASE_URL` w `.env`

**Problemy z autentykacją**
- Wyczyść cookies przeglądarki
- Sprawdź czy backend działa na porcie 3000
- Zweryfikuj format JWT tokenów

**Problemy z buildowaniem**
- Usuń `node_modules` i `npm install` ponownie
- Sprawdź wersje Node.js (≥18)
- Zweryfikuj czy wszystkie dependencies są zainstalowane

**TypeScript errors**
- Uruchom `npm run type-check` dla szczegółów
- Sprawdź czy wszystkie typy są poprawnie zaimportowane
- Unikaj `any` types - użyj konkretnych interfejsów

---
