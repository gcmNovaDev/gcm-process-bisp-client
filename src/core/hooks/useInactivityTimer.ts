import { useEffect, useRef, useCallback } from "react";

interface UseInactivityTimerOptions {
  /** Tiempo total de inactividad antes de logout (ms). Default: 15 min */
  timeoutMs?: number;
  /** Tiempo antes del timeout en que se muestra el warning (ms). Default: 13 min */
  warningMs?: number;
  /** Callback cuando se alcanza el tiempo de advertencia */
  onWarning: () => void;
  /** Callback cuando se alcanza el tiempo total de inactividad */
  onTimeout: () => void;
  /** Si es false el hook no registra listeners ni timers */
  enabled: boolean;
}

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos
const DEFAULT_WARNING_MS = 13 * 60 * 1000; // 13 minutos (2 min antes del logout)

/**
 * Hook de inactividad de usuario.
 *
 * Escucha eventos DOM reales (mouse, teclado, scroll, touch) para detectar
 * si el usuario está activo. Si no hay actividad en `warningMs`, dispara
 * `onWarning`. Si no hay actividad en `timeoutMs`, dispara `onTimeout`.
 *
 * Solo activo cuando `enabled === true` (ej: cuando el usuario está autenticado).
 * Se pausa automáticamente cuando la pestaña queda oculta (visibilitychange).
 *
 * Todos los listeners usan `{ passive: true }` para no bloquear el hilo principal.
 */
export function useInactivityTimer({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  warningMs = DEFAULT_WARNING_MS,
  onWarning,
  onTimeout,
  enabled,
}: UseInactivityTimerOptions) {
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onWarningRef = useRef(onWarning);
  const onTimeoutRef = useRef(onTimeout);

  // Mantener referencias actualizadas sin re-registrar listeners
  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();

    // Timer 1: Advertencia a los N minutos de inactividad
    warningTimerRef.current = setTimeout(() => {
      onWarningRef.current();
    }, warningMs);

    // Timer 2: Logout definitivo al alcanzar el timeout total
    timeoutTimerRef.current = setTimeout(() => {
      onTimeoutRef.current();
    }, timeoutMs);
  }, [clearTimers, warningMs, timeoutMs]);

  // Expone resetTimer para que el modal "Continuar" pueda reiniciarlo
  const resetTimer = useCallback(() => {
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // Eventos que indican actividad real del usuario
    const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      startTimers();
    };

    // Registrar listeners con passive:true para no bloquear scroll/touch
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Arrancar los timers por primera vez
    startTimers();

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, startTimers, clearTimers]);

  return { resetTimer };
}
