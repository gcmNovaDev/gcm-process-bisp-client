import axios, {
  AxiosInstance,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useAuthStore } from "@/gcm-bisp/components/store/authStore";

export enum AuthType {
  BasicAuthentication = "BasicAuthentication",
  SecurityAuthentication = "SecurityAuthentication",
}

type RetriableConfig = InternalAxiosRequestConfig & { __isRetry?: boolean };

class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Espera la hidratación (sessionStorage) para no perder el token en refresh
        await useAuthStore.getState().whenHydrated();

        const headers =
          config.headers instanceof AxiosHeaders
            ? config.headers
            : new AxiosHeaders(config.headers as any);

        const authType = headers.get("X-Auth-Type") as AuthType | undefined;
        headers.delete("X-Auth-Type");

        if (authType === AuthType.SecurityAuthentication) {
          const token = await useAuthStore.getState().getValidAccessToken();
          if (token) headers.set("Authorization", `Bearer ${token}`);
          else headers.delete("Authorization");
        }

        config.headers = headers;
        return config;
      },
      (error) => Promise.reject(error),
    );

    // RESPONSE
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      async (error) => {
        const original = error.config as RetriableConfig | undefined;
        if (!error.response || !original || original.__isRetry) {
          return Promise.reject(error);
        }

        // 401/403 -> Recuperación suave con cierre total como respaldo
        if (error.response.status === 401 || error.response.status === 403) {
          const platformLoginUrl =
            process.env.NEXT_PUBLIC_PLATFORM_LOGIN_URL ||
            "http://localhost:3001/plataform-process/Auth/Login";

          // CASO 1: Error explícito de autenticación (fuerza de sistema)
          if (error.response.data?.msg === "Error de autenticación") {
            const { setSessionError, forceLogout } = useAuthStore.getState();
            setSessionError("No estás autorizado. Redirigiendo al inicio de sesión...");
            
            // Pausa de 2 segundos para ver el mensaje
            await new Promise((resolve) => setTimeout(resolve, 2000));
            
            await forceLogout();
            if (window.parent && window.parent !== window) {
              window.parent.location.href = platformLoginUrl;
            } else {
              window.location.href = platformLoginUrl;
            }
            return Promise.reject(error);
          }

          // CASO 2: Intento de refresco para sesión expirada normal
          try {
            const newToken = await useAuthStore.getState().refreshTokens();
            if (!newToken) {
              const { setSessionError, forceLogout } = useAuthStore.getState();
              setSessionError("Sesión expirada. Redirigiendo al inicio de sesión...");
              
              await new Promise((resolve) => setTimeout(resolve, 2000));

              await forceLogout();
              if (window.parent && window.parent !== window) {
                window.parent.location.href = platformLoginUrl;
              } else {
                window.location.href = platformLoginUrl;
              }
              return Promise.reject(error);
            }

            // Reintento exitoso
            original.__isRetry = true;
            original.headers = new AxiosHeaders(original.headers as any);
            original.headers.set("Authorization", `Bearer ${newToken}`);
            
            // Asegurar que useAuthStore tenga el nuevo token antes del reintento
            if (!original.headers.get("X-Auth-Type")) {
              original.headers.set(
                "X-Auth-Type",
                AuthType.SecurityAuthentication,
              );
            }
            return this.axiosInstance(original);
          } catch (e) {
            const { setSessionError, forceLogout } = useAuthStore.getState();
            setSessionError("Error de sesión. Redirigiendo al inicio de sesión...");
            
            await new Promise((resolve) => setTimeout(resolve, 2000));

            await forceLogout();
            if (window.parent && window.parent !== window) {
              window.parent.location.href = platformLoginUrl;
            } else {
              window.location.href = platformLoginUrl;
            }
            return Promise.reject(error);
          }

        }




        return Promise.reject(error);
      },
    );
  }

  get instance(): AxiosInstance {
    return this.axiosInstance;
  }
}

const httpClient = new HttpClient(process.env.NEXT_PUBLIC_API_BASE_URL || "");
export default httpClient;
