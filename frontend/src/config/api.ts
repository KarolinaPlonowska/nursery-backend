// Konfiguracja API URL - zmienia się w zależności od środowiska
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Inne konfiguracje środowiskowe
export const APP_CONFIG = {
  API_URL,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;