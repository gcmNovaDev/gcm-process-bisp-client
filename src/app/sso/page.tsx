"use client";

import { useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/gcm-bisp/components/store/authStore";
import { persistUser, SSOLoginResponse } from "@/app/(routes)/gcm-bisp/Auth/api/types/auth.types";
import { validateSSOTokenAction } from "@/app/(routes)/gcm-bisp/Auth/api/actions/authActions";

function SSOLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth, setPermissions, isAuthenticated, hasHydrated } = useAuthStore();
  const tokenFromUrl = searchParams.get("t");
  const processedRef = useRef(false);

  const processToken = useCallback(async (token: string) => {
    // Origen permitido leído desde variable de entorno
    const platformOrigin = process.env.NEXT_PUBLIC_PLATFORM_ORIGIN || 'http://localhost:3001';

    try {
      if (processedRef.current) return;

      // Si ya está autenticado, no procesar de nuevo (evita fallo por token SSO expirado en reload)
      if (isAuthenticated) {
        const lastPath = sessionStorage.getItem('gcm_bisp_last_path');
        router.push(lastPath && lastPath !== '/sso' ? lastPath : "/gcm-bisp/dashboard");
        return;
      }

      processedRef.current = true;

      // 1. Validar el token LOCALMENTE usando la Server Action
      const result: SSOLoginResponse = await validateSSOTokenAction(token);

      // 2. Si el backend rechaza el token → denegar acceso y avisar al padre
      if (!result.valid || !result.data) {
        if (window.parent !== window) {
          window.parent.postMessage({ 
            type: process.env.NEXT_PUBLIC_SSO_EVENT_ERROR, 
            message: result.message || 'Token inválido' 
          }, platformOrigin);
        }

        const loginUrl = platformOrigin.endsWith('/') 
          ? `${platformOrigin}Auth/Login` 
          : `${platformOrigin}/Auth/Login`;
          
        if (window.parent && window.parent !== window) {
          window.parent.location.href = loginUrl;
        } else {
          window.location.href = loginUrl;
        }
        return;
      }

      // 3. Token válido → usar el access_token y datos reales emitidos por el backend
      const { user_id, username, email, access_token, refresh_token, system_id, sesion, sidebar, roles, permissions } = result.data;
      const ssoUser: persistUser = {
        success: true,
        message: "SSO Login Success",
        data: {
          usuario: {
            id: String(user_id),
            email: String(email),
            nombreCompleto: String(username),
            username: username,
            roles: roles || [],
          },
          tokens: { access_token, refresh_token },
          //DEBO MODIFICAR ESTA SESION CON DATOS REALES DE PLATAFORMA GCM
          sesion: sesion || { id: "sso-session", sessionIdString: "sso-session" },
          system_id,
          sidebar: sidebar || [],
        },
      };

      setAuth(ssoUser);

      // Inyectar los permisos del usuario directamente en el store de Zustand
      if (permissions) {
        const permStrings = permissions.map((p: any) => p.permission_name);
        setPermissions(permStrings);
      }
      
      // 4. Redirigir al Dashboard
      const lastPath = sessionStorage.getItem('gcm_bisp_last_path');
      router.push(lastPath && lastPath !== '/sso' ? lastPath : "/gcm-bisp/dashboard");
    } catch (error) {  
      if (window.parent !== window) {
        window.parent.postMessage({ 
          type: process.env.NEXT_PUBLIC_SSO_EVENT_ERROR, 
          message: 'Error de conexión con el servidor de seguridad.' 
        }, platformOrigin);
      }

      const loginUrl = platformOrigin.endsWith('/') 
        ? `${platformOrigin}Auth/Login` 
        : `${platformOrigin}/Auth/Login`;

      if (window.parent && window.parent !== window) {
        window.parent.location.href = loginUrl;
      } else {
        window.location.href = loginUrl;
      }
    }

  }, [setAuth, router]);

  useEffect(() => {
    // Timeout de seguridad: si en 5 segundos no llega nada
    const timeout = setTimeout(() => {
      if (!tokenFromUrl) {
      }
    }, 5000);

    // 1. Manejo de token desde URL
    if (hasHydrated && isAuthenticated && (tokenFromUrl || true)) {
       const lastPath = sessionStorage.getItem('gcm_bisp_last_path');
       router.push(lastPath && lastPath !== '/sso' ? lastPath : "/gcm-bisp/dashboard");
       return;
    }

    if (hasHydrated && !isAuthenticated && tokenFromUrl) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      processToken(tokenFromUrl);
    }

    // Origen permitido
    const platformOrigin = process.env.NEXT_PUBLIC_PLATFORM_ORIGIN || 'http://localhost:3001';

    // 2. Manejo de token desde postMessage
    const handleMessage = (event: MessageEvent): void => {
      // Si ya hay sesión de 30 minutos, ya no nos importan más mensajes del padre
      if (isAuthenticated) return;

      if (event.origin !== platformOrigin.replace(/\/$/, "")) {
        return;
      }

      if (event.data?.type === process.env.NEXT_PUBLIC_SSO_EVENT_TOKEN && event.data?.token) {
        clearTimeout(timeout);
        processToken(event.data.token);
      }
    };

    window.addEventListener('message', handleMessage);

    // 3. Informar al padre que el Iframe ya cargó
    if (window.parent !== window) {
      window.parent.postMessage({ type: process.env.NEXT_PUBLIC_SSO_EVENT_READY }, platformOrigin);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [tokenFromUrl, processToken, hasHydrated, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Estableciendo conexión segura...</p>
        <p className="text-xs text-gray-400 mt-2">Sincronizando identidad con el sistema GCM</p>
      </div>
    </div>
  );
}

export default function SSOPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando seguridad...</p>
      </div>
    }>
      <SSOLogic />
    </Suspense>
  );
}
