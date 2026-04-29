# GitHub Copilot Instructions - System Zarządzania Żłobkiem

<!-- Instrukcje workspace dla GitHub Copilot: https://code.visualstudio.com/docs/copilot/copilot-customization -->

## 🏗️ Architektura Projektu

To jest **fullstack aplikacja systemu zarządzania żłobkiem** składająca się z:
- **Backend**: NestJS + TypeScript + PostgreSQL + TypeORM
- **Frontend**: React + Vite + TypeScript + Ant Design

## 📱 Kontekst Biznesowy

System służy do zarządzania żłobkiem z trzema głównimi rolami użytkowników:
- **Admin** 👑: Pełny dostęp, zarządzanie systemem
- **Opiekun** 👨‍🏫: Zarządzanie przypisanymi grupami i dziećmi
- **Rodzic** 👨‍👩‍👧‍👦: Dostęp do informacji o własnych dzieciach

## 🔧 Backend (NestJS) - Konwencje

### Struktura i Architektura
- Używaj **modularnej architektury NestJS**
- Każdy moduł powinien mieć: controller, service, entity, module
- Stosuj **dependency injection** dla wszystkich serwisów
- Używaj **TypeORM** dla operacji bazodanowych

### Autentykacja i Autoryzacja
```typescript
// Zawsze używaj JWT dla autentykacji
- Access token (1h) + Refresh token (7d)
- httpOnly cookies dla bezpieczeństwa
- Role-based guards: @Roles('admin', 'caregiver', 'parent')
- JWT strategy z Passport
```

### Bezpieczeństwo
- **NIGDY nie hardkoduj sekretów** - używaj process.env
- Zawsze waliduj input z **class-validator**
- Używaj **bcrypt** do hashowania haseł (12 salt rounds)
- Implementuj **rate limiting** dla auth endpoints
- Stosuj **helmet** dla security headers

### Konwencje Kodowe Backend
```typescript
// DTO - zawsze z walidacją
export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;
  
  @IsEmail()
  email: string;
}

// Entity - relacje z lazy loading
@Entity('children')
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToMany(() => Parent, parent => parent.children)
  parents: Parent[];
}

// Service - error handling i transakcje
@Injectable()
export class ChildrenService {
  async createChild(dto: CreateChildDto): Promise<Child> {
    try {
      return await this.childRepository.save(dto);
    } catch (error) {
      throw new BadRequestException('Failed to create child');
    }
  }
}
```

### API Design
- RESTful endpoints: `/children`, `/parents/:id/children`
- HTTP kody: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden)
- Pagination dla list: `?page=1&limit=10`
- Filtering: `?role=parent&active=true`

## 🎨 Frontend (React) - Konwencje

### Struktura i Komponenty
- **Functional components** z hooks
- **TypeScript** dla wszystkich komponentów
- **Ant Design** dla wszystkich elementów UI
- Struktura folderów: `components/`, `views/`, `hooks/`, `utils/`, `contexts/`

### State Management i API
```typescript
// Używaj React Query/TanStack Query dla API calls
- Axios jako HTTP client
- Base URL z .env: VITE_API_BASE_URL
- Interceptors dla auth headers

// Context dla globalnego stanu
const AuthContext = createContext<AuthContextType | null>(null);
```

### Stylowanie i UI
- **Tylko Ant Design** komponenty (Button, Form, Table, Modal, etc.)
- Customowe style przez CSS modules lub styled-components
- Responsive design: mobile-first approach
- Polskie tłumaczenia dla wszystkich tekstów

### Routing i Nawigacja
```typescript
// React Router dla nawigacji
- Protected routes z RequireAuth component
- Role-based routing z guards
- Lazy loading dla większych komponentów
```

### Konwencje Kodowe Frontend
```typescript
// Komponenty - PascalCase, typed props
interface ChildListProps {
  children: Child[];
  loading?: boolean;
}

export const ChildList: React.FC<ChildListProps> = ({ children, loading }) => {
  // Hooks na górze
  const { user } = useAuth();
  const { data, isLoading } = useQuery(['children'], fetchChildren);
  
  // Early returns
  if (loading) return <Spin />;
  
  // JSX z Ant Design
  return (
    <Table 
      dataSource={children}
      columns={columns}
      rowKey="id"
    />
  );
};

// Custom hooks dla logiki biznesowej
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

## 🔐 Bezpieczeństwo Frontend
- **Walidacja po stronie klienta** + serwera
- **Sanitized user input** dla wszystkich form
- **Role-based UI** - ukrywaj elementy na podstawie ról
- **Secure token storage** w httpOnly cookies (nie localStorage)

## 📊 Zarządzanie Danymi

### Backend Models
- **User**: baseEntity z rolami (admin, parent, caregiver)
- **Child**: profile dziecka z medical info, emergency contacts
- **Parent/Caregiver**: rozszerzenia User entity
- **Group**: grupy dzieci z przypisanymi opiekunami  
- **Attendance**: records frekwencji z timestampami
- **Message**: komunikacja między użytkownikami

### Frontend Data Flow
```typescript
// API calls z error handling
const fetchChildren = async (): Promise<Child[]> => {
  try {
    const response = await api.get('/children');
    return response.data;
  } catch (error) {
    notification.error({ message: 'Błąd ładowania dzieci' });
    throw error;
  }
};
```

## 🌐 Internationalization (i18n)
- **Cały interface w języku polskim**
- Komunikaty błędów po polsku
- Formaty dat polskie (DD.MM.YYYY)
- Walidacja polskich formatów (telefon, PESEL)

## 🧪 Testowanie

### Backend Tests
```typescript
// Unit tests z Jest
describe('ChildrenService', () => {
  it('should create child with valid data', async () => {
    const dto: CreateChildDto = { firstName: 'Jan', lastName: 'Kowalski' };
    const result = await service.create(dto);
    expect(result.firstName).toBe('Jan');
  });
});
```

### Frontend Tests
```typescript
// React Testing Library
test('renders children list', () => {
  render(<ChildList children={mockChildren} />);
  expect(screen.getByText('Lista dzieci')).toBeInTheDocument();
});
```

## 🚀 Environment & Deployment
- **Docker** support z docker-compose
- **PostgreSQL** jako główna baza danych
- **.env** files dla konfiguracji (NIGDY w repo)
- **Winston** logging dla backend
- **Production builds** z optymalizacją

## 💡 Best Practices

1. **Always validate input** - backend i frontend
2. **Handle errors gracefully** - user-friendly messages
3. **Use TypeScript strictly** - no `any` types 
4. **Follow SOLID principles** - szczególnie Single Responsibility
5. **Write descriptive commit messages** po polsku
6. **Document complex logic** - JSDoc dla functions
7. **Performance first** - lazy loading, pagination, caching

## 🎯 Preferowane Patterns

- **Repository Pattern** dla data access
- **Factory Pattern** dla tworzenia entities
- **Observer Pattern** dla real-time updates
- **HOC Pattern** dla shared logic (frontend)
- **Custom Hooks** dla reusable state logic

---

**Cel**: Twórz bezpieczny, skalowalny i user-friendly system zarządzania żłobkiem z naciskiem na jakość kodu i doświadczenie użytkownika.