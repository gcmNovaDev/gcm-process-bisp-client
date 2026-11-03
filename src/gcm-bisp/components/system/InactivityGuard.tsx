"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useInactivityTimer } from "@/core/hooks/useInactivityTimer";
import InactivityWarningModal from "./InactivityWarningModal";

const TIMEOUT_MS = 15 * 60 * 1000;  // 15 minutos de inactividad
const WARNING_MS = 13 * 60 * 1000;  // Advertencia a los 13 min (2 min antes del logout)
const COUNTDOWN_SECS = 120;          // 2 minutos de countdown en el modal

/**
 * InactivityGuard — Orquestador de cierre de sesión por inactividad.
 *
 * Responsabilidades:
 *  1. Activar el hook de detección de inactividad (useInactivityTimer) cuando
 *     el usuario está autenticado.
 *  2. Mostrar InactivityWarningModal cuando se alcanza el tiempo de advertencia.
 *  3. Ejecutar el logout completo cuando el usuario no responde al modal.
 *  4. Notificar al frame padre (Platform) vía postMessage para que redirija
 *     la ventana principal al login — evitando que el redirect quede atrapado
 *     dentro del iframe.
 *
 * Este componente NO gestiona errores de autenticación de servidor (401/403),
 * eso es responsabilidad de SessionErrorListener. Aquí solo se maneja
 * la inactividad por tiempo sin interacción del usuario.
 */
export default function InactivityGuard() {
  const { isAuthenticated, forceLogout } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);

  /**
   * executeLogout — Flujo de cierre de sesión por inactividad.
   *
   * 1. Revoca el refresh_token en el backend (IAM/Platform) e invalida la sesión local.
   * 2. Si Process está corriendo como iframe hijo de Platform, envía postMessage
   *    para que Platform redirija la ventana COMPLETA al login (no solo el iframe).
   * 3. Si Process corre en modo standalone, hace el redirect directamente.
   */
  const executeLogout = useCallback(async () => {
    setShowWarning(false);

    const platformLoginUrl =
      process.env.NEXT_PUBLIC_PLATFORM_LOGIN_URL ||
      "http://localhost:3001/plataform-process/Auth/Login";
    const platformOrigin =
      process.env.NEXT_PUBLIC_PLATFORM_ORIGIN || "http://localhost:3001";

    // 1. Limpiar sesión local + revocar refresh token en el servidor
    await forceLogout();

    // 2. Notificar al padre (Platform) o redirigir directamente
    if (window.parent && window.parent !== window) {
      // Modo iframe: el mensaje viaja al host (Platform) que redirige la ventana principal
      window.parent.postMessage(
        { type: process.env.NEXT_PUBLIC_SSO_EVENT_TIMEOUT ?? "GCM_SESSION_TIMEOUT", reason: "inactivity" },
        platformOrigin.replace(/\/$/, "")
      );
    } else {
      // Modo standalone: Process corre solo, redirigir directamente
      window.location.href = platformLoginUrl;
    }
  }, [forceLogout]);

  const handleWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const { resetTimer } = useInactivityTimer({
    timeoutMs: TIMEOUT_MS,
    warningMs: WARNING_MS,
    onWarning: handleWarning,
    onTimeout: executeLogout,
    enabled: isAuthenticated,
  });

  const handleContinue = useCallback(() => {
    setShowWarning(false);
    resetTimer();
  }, [resetTimer]);

  return (
    <InactivityWarningModal
      isOpen={showWarning}
      countdownSecs={COUNTDOWN_SECS}
      onContinue={handleContinue}
      onExpired={executeLogout}
    />
  );
}
