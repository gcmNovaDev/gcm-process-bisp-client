// Respuesta de GET /api/ (ruta pública de salud de la API)
export interface ApiStatus {
    ok: boolean;
    message: string;
    timestamp: string;
}

// Contrato estándar de la API (src/core/http/api-response.ts en gcm-process-bisp-api)
export interface ResponseApi<T> {
    success: boolean;
    message: string;
    error?: string;
    data: T;
}

// Nodo del árbol de carpetas que se muestra en la pantalla
export interface FolderNode {
    name: string;
    description?: string;
    isFile?: boolean;
    children?: FolderNode[];
}

// Capa de la arquitectura (tarjeta + modal de detalle)
export interface ArchitectureLayer {
    id: string;
    title: string;
    icon: string;
    path: string;
    summary: string;
    details: string[];
    example?: string;
}

// Paso del flujo de una petición (UI -> BD)
export interface RequestFlowStep {
    id: string;
    title: string;
    where: string;
    description: string;
    side: "client" | "api" | "db";
}
