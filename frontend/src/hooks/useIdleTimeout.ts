import { useEffect, useRef, useState } from 'react';

interface UseIdleTimeoutProps {
  onIdle: () => void;
  idleTime?: number; // czas w milisekundach (domyślnie 30 minut)
  warningTime?: number; // czas ostrzeżenia przed wylogowaniem (domyślnie 2 minuty)
}

export const useIdleTimeout = ({ 
  onIdle, 
  idleTime = 30 * 60 * 1000, // 30 minut
  warningTime = 2 * 60 * 1000 // 2 minuty
}: UseIdleTimeoutProps) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const timeoutRef = useRef<number | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const resetTimer = () => {
    setIsIdle(false);
    setShowWarning(false);
    setTimeLeft(0);

    // Wyczyść istniejące timery
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Ustaw timer ostrzeżenia
    warningTimeoutRef.current = window.setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(warningTime / 1000); // konwertuj na sekundy

      // Odliczanie
      countdownRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, idleTime - warningTime);

    // Ustaw timer wylogowania
    timeoutRef.current = window.setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, idleTime);
  };

  const handleActivity = () => {
    // Nie resetuj timera jeśli ostrzeżenie jest już wyświetlone
    if (!showWarning) {
      resetTimer();
    }
  };

  useEffect(() => {
    // Lista zdarzeń do monitorowania aktywności
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Dodaj nasłuchiwacze zdarzeń
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Inicjalizuj timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [idleTime, warningTime, onIdle, showWarning]);

  return { isIdle, showWarning, timeLeft, resetTimer };
};
