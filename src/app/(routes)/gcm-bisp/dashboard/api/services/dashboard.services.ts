import apiService from "@/core/http/request-apis.service";
import { AuthType } from "@/core/http/http-client.service";
import { ApiStatus } from "../types/dashboard.types";

//baseURL
const baseURL = process.env.NEXT_PUBLIC_APP_BASE_URL || "";

//getApiStatus
// Ruta pública: AuthType.BasicAuthentication -> el interceptor NO agrega el token.
// Para rutas protegidas usar AuthType.SecurityAuthentication -> el interceptor agrega
// "Authorization: Bearer <token>" y, si la API responde 401/403, refresca el token y reintenta.
export const getApiStatus = async () => {
    try {
        const data = await apiService.get<ApiStatus>(
            `${baseURL}`,
            AuthType.BasicAuthentication,
        );
        return data;
    } catch (error) {
        console.error("Error al obtener el estado de la API", error);
        throw error;
    }
}

// Ejemplo de una ruta protegida (patrón a seguir en cada feature):
//
// export const getAllShifts = async () => {
//     try {
//         const data = await apiService.get<ResponseApi<Shifts[]>>(
//             `${baseURL}shifts`,
//             AuthType.SecurityAuthentication,
//         );
//         return data;
//     } catch (error) {
//         console.error("Error al obtener los turnos", error);
//         throw error;
//     }
// }
