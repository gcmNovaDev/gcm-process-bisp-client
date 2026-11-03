"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  persistUser,
  Tokens,
  BackendLoginPayload,
} from "../../../app/(routes)/gcm-bisp/Auth/api/types/auth.types";

type AuthState = {
  auth: persistUser | null;
  isAuthenticated: boolean;

  permissions: string[];
  setPermissions: (permissions: string[]) => void;

  // hidratación (espera a sessionStorage)
  hasHydrated: boolean;
  whenHydrated: () => Promise<void>;

  sessionError: string | null;
  setSessionError: (error: string | null) => void;

  setAuth: (payload: persistUser) => void;
  setTokens: (tokens: Tokens | null) => void;
  logout: () => void;
  forceLogout: () => Promise<void>;
  getValidAccessToken: () => Promise<string | null>;
  refreshTokens: () => Promise<string | null>;
};

const API_BASE = process.env.NEXT_PUBLIC_PLATFORM_ORIGIN_API || "";
let refreshPromise: Promise<string | null> | null = null;

// ===== utils =====
function parseJwtExp(accessToken?: string): number | null {
  if (!accessToken) return null;
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return null;

    let b64 = parts[1];
    // Reemplazar caracteres de Base64URL
    b64 = b64.replace(/-/g, "+").replace(/_/g, "/");

    // Añadir padding (relleno) si es necesario
    while (b64.length % 4) {
      b64 += "=";
    }

    const json = JSON.parse(atob(b64));
    return typeof json?.exp === "number" ? json.exp : null;
  } catch (error) {
    return null;
  }
}

/**
 * El access token dura 1 hora.
 * Con skew de 2 min, refrescamos cuando falten <= 120s para expirar
 * (o si no se puede leer 'exp', usamos expires_at si viene).
 */
function isTokenExpiringSoon(tokens?: Tokens | null, skewSec = 120): boolean {
  if (!tokens?.access_token) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  const exp = parseJwtExp(tokens.access_token);
  if (exp) return exp - nowSec <= skewSec;

  if (tokens.expires_at) {
    const parsed = new Date(tokens.expires_at.replace(" ", "T"));
    if (!isNaN(parsed.getTime())) {
      const expSec = Math.floor(parsed.getTime() / 1000);
      return expSec - nowSec <= skewSec;
    }
  }
  // si no podemos determinar, asumimos que expira pronto
  return true;
}

/**
 * deviceId persistente por dispositivo (localStorage),
 * pero tokens y sesión viven SOLO en sessionStorage
 * (se borran al cerrar pestaña/ventana).
 */
function getDeviceInfo() {
  const isBrowser = typeof window !== "undefined";
  const userAgent = isBrowser ? navigator.userAgent : "SSR";
  const platform = isBrowser ? (navigator as any).platform || "Web" : "Server";
  let deviceId = "device-unknown";
  if (isBrowser) {
    try {
      deviceId =
        localStorage.getItem("deviceId") ||
        (crypto?.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}`);
      localStorage.setItem("deviceId", deviceId);
    } catch {
      deviceId = `dev-${Date.now()}`;
    }
  }
  return { userAgent, platform, deviceId };
}

// Promesa de hidratación
let hydrationResolve: (() => void) | null = null;
const hydrationPromise = new Promise<void>((res) => (hydrationResolve = res));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      auth: null,
      isAuthenticated: false,
      permissions: [],

      hasHydrated: false,
      whenHydrated: () => hydrationPromise,

      sessionError: null,
      setSessionError: (error) => set({ sessionError: error }),
      setPermissions: (permissions) => set({ permissions }),

      setAuth: (payload) => {
        const access = payload?.data?.tokens?.access_token;
        set({
          auth: payload,
          isAuthenticated: Boolean(access && access.length > 0),
        });
      },

      setTokens: (tokens) => {
        const current = get().auth;
        if (!current) return;
        const merged: persistUser = {
          ...current,
          data: { ...current.data, tokens: tokens ?? ({} as Tokens) },
        };
        set({ auth: merged, isAuthenticated: Boolean(tokens?.access_token) });
      },
      logout: () => {
        set({ auth: null, isAuthenticated: false, permissions: [] });
      },

      /**
       * Cierre de sesión total: invalida el refresh_token en el servidor (Plataforma/IAM)
       * y limpia el estado local.
       */
      forceLogout: async () => {
        const refresh_token = get().auth?.data?.tokens?.refresh_token;

        if (refresh_token) {
          try {
            await fetch(`${API_BASE}auth/logout/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ token: refresh_token }),
              cache: "no-store",
            });
          } catch (error) {}
        }

        // Siempre limpiar localmente
        set({ auth: null, isAuthenticated: false, permissions: [] });
      },

      /**
       * Devuelve un access token válido (refresca si faltan <= 2 min).
       * Mientras la pestaña siga abierta, el token se renueva de forma transparente.
       */
      getValidAccessToken: async () => {
        const tokens = get().auth?.data?.tokens;
        if (!tokens?.access_token && !tokens?.refresh_token) return null;

        if (!tokens?.access_token || isTokenExpiringSoon(tokens)) {
          return await get().refreshTokens();
        }
        return tokens.access_token ?? null;
      },

      /**
       * Intenta refrescar tokens. No tumba sesión por fallos transitorios (red/5xx).
       * Sí cierra sesión cuando el backend confirma refresh inválido/expirado (400/401 con mensaje).
       */
      refreshTokens: async () => {
        if (refreshPromise) {
          return refreshPromise;
        }

        refreshPromise = (async () => {
          const refresh_token = get().auth?.data?.tokens?.refresh_token;
          const system_id = get().auth?.data?.system_id;

          if (!refresh_token) {
            set({ auth: null, isAuthenticated: false });
            return null;
          }

          const dispositivoInfo = getDeviceInfo();

          try {
            const resp = await fetch(`${API_BASE}auth/refresh-systems/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                token: refresh_token,
                system_id: system_id,
              }),
              cache: "no-store",
            });

            if (!resp.ok) {
              const errorText = await resp.text().catch(() => null);

              if (resp.status === 400 || resp.status === 401) {
                set({ auth: null, isAuthenticated: false });
                return null;
              }

              return get().auth?.data?.tokens?.access_token ?? null;
            }

            const refreshData = await resp.json();

            const newAccessToken = refreshData?.data?.access_token;

            if (newAccessToken) {
              const currentAuth = get().auth;

              if (currentAuth) {
                const updatedAuth = {
                  ...currentAuth,
                  data: {
                    ...currentAuth.data,
                    tokens: {
                      ...currentAuth.data.tokens,
                      access_token: newAccessToken,
                    },
                  },
                };

                set({ auth: updatedAuth, isAuthenticated: true });
              }

              return newAccessToken;
            }

            return null;
          } catch (error) {
            return null;
          } finally {
            refreshPromise = null;
          }
        })();

        return refreshPromise;
      },
    }),
    {
      name: "auth-storage",
      // ⚠️ Ahora usamos sessionStorage: sobrevive refresh, pero NO cierra al cerrar pestaña
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => sessionStorage)
          : undefined,
      partialize: (state) => ({
        auth: state.auth,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),

      onRehydrateStorage: () => (state) => {
        // Se ejecuta DESPUÉS de leer sessionStorage
        setTimeout(async () => {
          try {
            // marca hidratado y libera a los interceptores
            useAuthStore.setState({ hasHydrated: true });
            hydrationResolve?.();

            // Verificación en frío:
            const access =
              useAuthStore.getState().auth?.data?.tokens?.access_token;

            if (access) {
              try {
                const resp = await fetch(`${API_BASE}auth/verify-token/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${access}`,
                  },
                  body: JSON.stringify({ token: access }),
                  cache: "no-store",
                });

                // Si la respuesta no es OK (ej: 400/401), el token es inválido
                if (!resp.ok) {
                  const newToken = await useAuthStore
                    .getState()
                    .refreshTokens();
                  if (!newToken) {
                  }
                } else {
                  const res = await resp.json();
                  // Si el token ya no es válido según el backend, intenta refrescar
                  if (!res?.success || !res?.data?.token_valid) {
                    await useAuthStore.getState().refreshTokens();
                  }
                }
              } catch (err) {
                // fallo de red (fetch falló) ⇒ no cerrar sesión para permitir reintentos
              }
            } else {
              const hasRefresh =
                !!useAuthStore.getState().auth?.data?.tokens?.refresh_token;
              if (hasRefresh) {
                useAuthStore
                  .getState()
                  .refreshTokens()
                  .catch(() => {});
              }
            }
          } catch {
            // noop
          }
        }, 0);
      },
    },
  ),
);
