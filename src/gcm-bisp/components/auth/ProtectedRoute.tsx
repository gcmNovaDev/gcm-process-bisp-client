'use client'

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Loader } from "../system/Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  
  // URL del login central en Plataform
  const platformLoginUrl = process.env.NEXT_PUBLIC_PLATFORM_LOGIN_URL || "http://localhost:3001/plataform-process/Auth/Login";

  // Solo en desarrollo: permite navegar sin sesión mientras el sistema no esté registrado en IAM/Platform
  const skipAuth = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

  useEffect(() => {
    if (skipAuth) return;
    // Si ya hidrató (leyó de storage) y no está autenticado -> fuera
    if (hasHydrated && !isAuthenticated) {
       if (window.parent && window.parent !== window) {
         window.parent.location.href = platformLoginUrl;
       } else {
         window.location.href = platformLoginUrl;
       }
    }
  }, [hasHydrated, isAuthenticated, platformLoginUrl, skipAuth]);

  if (skipAuth) return <>{children}</>;

  // Mientras se verifica o se redirige, mostramos un loader de pantalla completa
  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader isVisible={true} message="Verificando sesión segura..." />
      </div>
    );
  }

  // Si está autenticado y hidratado, renderizamos el contenido protegido
  return <>{children}</>;
}

