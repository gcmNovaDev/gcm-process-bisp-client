export interface LoginRequest {
  email: string;
  password: string;
}

export interface TipoUsuario {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface Rol {
  id: number;
  codigo: string;
  nombre: string;
  permisos?: any;
  descripcion?: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  username: string;
  roles: Rol[];
  fechaUltimaConexion?: string;
}

export interface Tokens {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: string;
}

export interface Sesion {
  id: string;
  sessionIdString: string;
  tokenAccesoId?: string;
  fechaInicio?: string;
}

export interface BackendLoginPayload {
  success: boolean;
  message: string;
  data?: {
    usuario: Usuario;
    tokens?: Tokens;
    sesion?: Sesion;
  };
}

export type TwoFactorSendRequest = {
  email: string;
  tipoVerificacion: "TWO_FACTOR_AUTH" | "PASSWORD_RESET";
};

export type TwoFactorVerifyRequest = {
  email: string;
  codigo: string;
};

export interface GenericBackendResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
export interface PayloadResetPass {
  correo_electronico: string;
  nuevo_password: string;
}

export type TwoFactorVerifyCodeRequest = {
  email: string;
  codigo: string;
};

export interface LogoutRequest {
  cerrarTodasLasSesiones: boolean;
  motivoLogout: "LOGOUT";
}

export interface LogoutData {
  usuarioId?: string;
  tokensRevocados?: string;
  sesionesCerradas?: string;
  fechaLogout?: string;
  cerrarTodasLasSesiones?: boolean;
  motivoLogout?: string;
}

export interface persistUser {
  success: true;
  message: string;
  data: {
    usuario: Usuario;
    tokens: Tokens;
    sesion: Sesion;
    system_id?: string | number;
    sidebar?: any[];
  };
}

export interface VerifiyAccesResponse {
  success: boolean;
  message: string;
  data: Data;
}

export interface Data {
  usuario: Usuario;
}

export interface SSOLoginResponse {
  valid: boolean;
  message: string;
  data: {
    user_id: string;
    email: string;
    username: string;
    access_token: string;
    refresh_token?: string;
    system_id?: string | number;
    sesion?: Sesion;
    sidebar?: any[];
    roles?: any[];
    permissions?: any[];
  };
}
