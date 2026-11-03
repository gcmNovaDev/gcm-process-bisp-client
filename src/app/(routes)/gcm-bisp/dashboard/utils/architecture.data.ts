import { ArchitectureLayer, FolderNode, RequestFlowStep } from "../api/types/dashboard.types";

// Estructura de un feature (pantalla). Este mismo dashboard sigue el patrón.
export const featureStructure: FolderNode = {
  name: "src/app/(routes)/gcm-bisp/<grupo>/<Feature>",
  description: "Una carpeta por pantalla, agrupada por módulo (administration, reception, ...)",
  children: [
    { name: "page.tsx", isFile: true, description: "Pantalla: estado, llamadas a services y composición de componentes" },
    {
      name: "api",
      description: "Todo lo que habla con la API",
      children: [
        {
          name: "services",
          children: [{ name: "<feature>.services.ts", isFile: true, description: "Funciones async que usan apiService + AuthType" }],
        },
        {
          name: "types",
          children: [{ name: "<feature>.types.ts", isFile: true, description: "Interfaces de payloads y respuestas" }],
        },
      ],
    },
    {
      name: "components",
      description: "Componentes propios de la pantalla (formularios, tablas, tarjetas)",
      children: [
        { name: "<Feature>Table.tsx", isFile: true },
        { name: "<Feature>Forms.tsx", isFile: true },
        {
          name: "Modals",
          children: [{ name: "<Accion>Modal.tsx", isFile: true, description: "Modales sobre ModalBasic / ModalAction" }],
        },
      ],
    },
    {
      name: "utils",
      description: "(Opcional) constantes y helpers solo de esta pantalla",
      children: [{ name: "<feature>.data.ts", isFile: true }],
    },
  ],
};

// Capas del cliente
export const architectureLayers: ArchitectureLayer[] = [
  {
    id: "features",
    title: "Features (pantallas)",
    icon: "LayoutPanelTop",
    path: "src/app/(routes)/gcm-bisp",
    summary: "Cada pantalla es una carpeta autocontenida con su page, api y components.",
    details: [
      "Se agrupan por módulo: administration, reception, reports, etc.",
      "layout.tsx de gcm-bisp envuelve todas las pantallas con Sidebar, Header y ProtectedRoute.",
      "Una pantalla solo importa de su propia carpeta, de src/core y de src/gcm-bisp/components.",
      "Si otra pantalla necesita el mismo tipo o service, se importa desde la carpeta de esa pantalla (como hace process con farms.services).",
    ],
    example: "gcm-bisp/dashboard (esta pantalla)",
  },
  {
    id: "http",
    title: "HTTP + Interceptores",
    icon: "ArrowLeftRight",
    path: "src/core/http",
    summary: "apiService centraliza GET/POST/PUT/PATCH/DELETE y los interceptores de axios manejan el token.",
    details: [
      "request-apis.service.ts: apiService.get/post/put/patch/delete(url, data, AuthType).",
      "AuthType.BasicAuthentication: petición sin token (rutas públicas).",
      "AuthType.SecurityAuthentication: el interceptor de request espera la hidratación del store y agrega Authorization: Bearer <token>.",
      "Interceptor de response: devuelve response.data directo; ante 401/403 refresca el token una vez y reintenta, si falla cierra sesión.",
    ],
    example: "apiService.get<ApiStatus>(`${baseURL}`, AuthType.BasicAuthentication)",
  },
  {
    id: "providers",
    title: "Providers",
    icon: "Layers",
    path: "src/core/providers",
    summary: "Contextos globales montados en app/layout.tsx.",
    details: [
      "ThemeProvider: tema claro/oscuro (next-themes).",
      "AppProvider: estado del sidebar (abierto/cerrado).",
      "ToastProvider: useToast().showToast(mensaje, 'success' | 'warning' | 'error').",
      "LoaderProvider: loader de pantalla completa para acciones largas.",
      "DeviceProvider: isMobile / isReady para pantallas responsivas y versiones *Mobile.",
      "AuthProvider y SelectedItemsContext: sesión y selección compartida.",
    ],
  },
  {
    id: "stores",
    title: "Stores (zustand)",
    icon: "Database",
    path: "src/gcm-bisp/components/store",
    summary: "Estado global persistente: sesión, módulo activo y stores de flujos largos.",
    details: [
      "authStore: usuario, tokens, permisos y sidebar que llegan desde IAM (persistido en sessionStorage).",
      "useModuleStore: setModule(nombre, descripción) para el título del Header.",
      "Crear un store solo cuando el estado debe sobrevivir entre pantallas (ej. un proceso de varios pasos).",
    ],
    example: "useModuleStore((s) => s.setModule)(\"Dashboard\", \"Arquitectura del proyecto\")",
  },
  {
    id: "system",
    title: "Componentes del sistema",
    icon: "Component",
    path: "src/gcm-bisp/components/system",
    summary: "Kit de UI reutilizable: inputs, botones, modales, dropdowns, tablas, toasts, fechas.",
    details: [
      "Formularios: InputGeneric, AutoComplete, DropdownFull*, DropdownMultiSelect, Datepicker, InputTimepicker, SwitchGeneric, RadioButton.",
      "Acciones: ButtonGeneric, DeleteButton, ButtonGoBack, EditMenu.",
      "Modales: ModalBasic, ModalAction, ModalLarge, ModalWhite, ModalBlank.",
      "Feedback: Toast, Notification, Banner, Loader, Badge, Tooltip.",
      "Listados: PaginationClassic, PaginationNumeric, SearchForm, AccordionTableItem.",
      "Sesión: InactivityGuard, SessionErrorListener, GlobalErrorUI.",
    ],
  },
  {
    id: "ui",
    title: "Layout UI",
    icon: "PanelLeft",
    path: "src/gcm-bisp/components/ui",
    summary: "Header, Sidebar, Logo y menú de sesión.",
    details: [
      "El menú del Sidebar viene de IAM (auth.data.sidebar) filtrado por permisos (can_access).",
      "El link al Dashboard siempre está visible.",
      "Icon recibe el nombre de un ícono de lucide-react.",
    ],
  },
  {
    id: "hooks",
    title: "Hooks",
    icon: "Anchor",
    path: "src/gcm-bisp/components/hooks · src/core/hooks",
    summary: "Lógica reutilizable sin UI.",
    details: [
      "useExportToExcel / useExportToPdf: exportar tablas.",
      "useFormatNumber / useFormatCurrency / useHondurasDate: formatos de negocio.",
      "usePermissions: hasPermission / hasAnyPermission según IAM.",
      "useInactivityTimer, useGoBack, useDevice, useClock.",
    ],
  },
];

// Flujo completo de una petición protegida
export const requestFlow: RequestFlowStep[] = [
  { id: "page", side: "client", title: "page.tsx", where: "feature", description: "Llama al service dentro de un useEffect o un handler." },
  { id: "service", side: "client", title: "<feature>.services.ts", where: "feature/api/services", description: "apiService.post(url, payload, AuthType.SecurityAuthentication)." },
  { id: "interceptor", side: "client", title: "Interceptores axios", where: "src/core/http", description: "Agrega el Bearer token; si vence, refresca y reintenta." },
  { id: "jwt", side: "api", title: "validarJWT", where: "middlewares", description: "Verifica el token contra IAM y adjunta el usuario al request." },
  { id: "route", side: "api", title: "routes/<grupo>/<entidad>.routes.ts", where: "routes", description: "Mapea verbo + URL al controller." },
  { id: "controller", side: "api", title: "controller", where: "modules/<grupo>/<Entidad>", description: "Lee req, llama al service y responde con successResponse / errorResponse." },
  { id: "apiservice", side: "api", title: "service", where: "modules/<grupo>/<Entidad>", description: "Reglas de negocio y validaciones." },
  { id: "repository", side: "api", title: "repository", where: "modules/<grupo>/<Entidad>", description: "pool.request().input(...).execute('dbo.SP')." },
  { id: "db", side: "db", title: "SQL Server", where: "PROCESS-BISP", description: "Stored procedures de la base del proyecto." },
];
