export function getToken() {
  // Token jest teraz w httpOnly cookie, nie w localStorage
  // Frontend nie może go bezpośrednio odczytać dla bezpieczeństwa
  // Backend automatycznie dołączy go do requestów gdy użyjemy withCredentials: true
  return localStorage.getItem('token'); // Fallback dla kompatybilności wstecznej
}

export function getUserRole() {
  // Role będzie przechowywane w sessionStorage na podstawie ostatniego logowania
  const storedRole = sessionStorage.getItem('userRole');
  if (storedRole) return storedRole;
  
  // Lub pobierz z profilu
  return null;
}

export function getUser() {
  // Użytkownik będzie przechowywany w sessionStorage
  const user = sessionStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }
  return null;
}

export function setUser(user: any, role: string) {
  // Przechowuj dane użytkownika w sessionStorage (czyszczony przy zamknięciu)
  sessionStorage.setItem('user', JSON.stringify(user));
  sessionStorage.setItem('userRole', role);
}

export function logout(navigate: any, reason?: string) {
  // Usuń dane z sessionStorage
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userRole');
  
  // Zapisz powód wylogowania jeśli podany
  if (reason) {
    sessionStorage.setItem('logoutReason', reason);
  }
  
  navigate('/login');
}

export function getLogoutReason() {
  const reason = sessionStorage.getItem('logoutReason');
  if (reason) {
    sessionStorage.removeItem('logoutReason');
    return reason;
  }
  return null;
}
