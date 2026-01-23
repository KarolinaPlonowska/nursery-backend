import axios from 'axios';
import { API_URL } from '../config/api';

// Skonfiguruj axios aby automatycznie wysyłał cookies
axios.defaults.withCredentials = true;

// Ustaw domyślny URL API
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Wysyłaj cookies z każdym requestem
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// Interceptor dla odpowiedzi - obsługa 401 i auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Jeśli refresh jest w toku, dodaj żądanie do kolejki
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Spróbuj odświeżyć token
        await apiClient.post('/auth/refresh-token');
        processQueue(null, true);
        // Ponów oryginalne żądanie
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Jeśli refresh nie zadziałał, wyloguj użytkownika
        processQueue(refreshError, null);
        
        // Wyczyść wszystkie dane sesji
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userRole');
        sessionStorage.setItem('logoutReason', 'Sesja wygasła. Zaloguj się ponownie.');
        
        // Przekieruj na stronę logowania
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
