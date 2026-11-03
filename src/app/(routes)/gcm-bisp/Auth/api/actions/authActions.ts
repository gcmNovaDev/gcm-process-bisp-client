"use server";

import jwt from "jsonwebtoken";
import { SSOLoginResponse } from "../types/auth.types";
import { encryptToken } from "@/core/utils/crypto";

/**
 * Valida un token SSO de la plataforma y genera un Access Token local para Procesos.
 */
export async function validateSSOTokenAction(
  token: string,
): Promise<SSOLoginResponse> {
  const apiKeyPlataform = process.env.API_KEY_PLATAFORM || "";
  const systemProcessSecret = process.env.API_KEY_SYSTEM_4 || "";

  if (!apiKeyPlataform || !systemProcessSecret) {
    return {
      valid: false,
      message: "Configuración del servidor incompleta (Secretos faltantes).",
      data: {
        user_id: "",
        username: "",
        email: "",
        access_token: "",
        refresh_token: "",
        system_id: "",
      },
    };
  }

  try {
    // 1. Verificar el token SSO (firmado por la Plataforma con API_KEY_PLATAFORM)
    const payload = jwt.verify(token, apiKeyPlataform) as any;

    const { user_id, username, email, refresh_token, system_id, sesion, sidebar, roles, permissions } =
      payload;

    // 2. Generar un nuevo Access Token para el sistema de Procesos
    const jwtPayload = { user_id, username, email };

    return new Promise((resolve) => {
      jwt.sign(
        jwtPayload,
        systemProcessSecret,
        { expiresIn: "5m" },
        (err, accessToken) => {
          if (err || !accessToken) {
            resolve({
              valid: false,
              message: "Error al generar el token de acceso local.",
              data: {
                user_id: "",
                username: "",
                email: "",
                access_token: "",
                refresh_token: "",
                system_id: "",
              },
            });
          } else {
            resolve({
              valid: true,
              message: "SSO validado localmente.",
              data: {
                user_id,
                username,
                email,
                access_token: accessToken,
                refresh_token,
                system_id,
                sesion,
                sidebar: sidebar || [],
                roles: roles || [],
                permissions: permissions || [],
              },
            });
          }
        },
      );
    });
  } catch (error) {
    return {
      valid: false,
      message: "Token SSO inválido o su sesión ha expirado.",
      data: {
        user_id: "",
        username: "",
        email: "",
        access_token: "",
        refresh_token: "",
        system_id: "",
      },
    };
  }
}

/**
 * Genera un token corto (30s) para enviar a Electron mediante SSO
 */
export async function generateElectronTokenAction(
  sessionData: any,
): Promise<{ success: boolean; token?: string; message?: string }> {
  const systemProcessSecret = process.env.API_KEY_SYSTEM_1 || "";

  if (!systemProcessSecret) {
    return {
      success: false,
      message: "Configuración del servidor incompleta (Secreto faltante).",
    };
  }

  try {
    // Excluir el campo 'sidebar' y 'permissions' que contienen datos pesados
    // y no son requeridos por la aplicación de Electron, evitando exceder los límites de URL de Windows/Navegadores.
    const { sidebar, permissions, ...cleanSessionData } = sessionData;

    const jwtPayload = {
      ...cleanSessionData,
      system_id: 1,
    };

    return new Promise((resolve) => {
      jwt.sign(
        jwtPayload,
        systemProcessSecret,
        { expiresIn: "2m" },
        (err, token) => {
          if (err || !token) {
            resolve({
              success: false,
              message: "Error al generar el token para Electron.",
            });
          } else {
            try {
              const encryptedToken = encryptToken(token, systemProcessSecret);
              resolve({ success: true, token: encryptedToken });
            } catch (encryptErr: any) {
              resolve({
                success: false,
                message: "Error al cifrar el token para Electron: " + encryptErr.message,
              });
            }
          }
        },
      );
    });
  } catch (error) {
    return { success: false, message: "Error interno al generar el token." };
  }
}
