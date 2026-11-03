import httpClient from "@/core/http/http-client.service";
import { SSOLoginResponse } from "../types/auth.types";

export class AuthService {
  static async ssoLogin(token: string): Promise<SSOLoginResponse> {
    return await httpClient.instance.post<any, SSOLoginResponse>(
      "auth/sso-log",
      { token },
    );
  }
}
