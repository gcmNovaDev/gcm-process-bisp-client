import { useCallback } from "react";
import * as XLSX from "xlsx";
import { getHondurasFileNameTimestamp, getHondurasTimeForFileName } from "./useHondurasDate";

interface ExportOptions {
  data: Array<Record<string, unknown>> | unknown[];
  fileName: string;
  autoTimestamp?: boolean;
}

export default function useExportToExcel() {
  const exportToExcel = useCallback(({ data, fileName, autoTimestamp = true }: ExportOptions) => {
    // 1. Manejo de caso: Data vacía o nula
    if (!data || data.length === 0) {
      console.warn("No hay datos para exportar a Excel.");
      return;
    }

    // 2. Manejo de caso: Nombres de archivo inválidos
    if (!fileName || fileName.trim() === "") {
      console.warn("El nombre de archivo es inválido.");
      return;
    }

    try {
      // 3. Sanitizar nombre base sin extensión
      let baseName = fileName.trim().replace(/\.xlsx$/i, "");

      // 4. Agregar fecha y hora si autoTimestamp está activo
      if (autoTimestamp) {
        // ¿Ya tiene hora al final (ej. _15-30 o _15-30-22)?
        const hasTime = /_\d{2}-\d{2}(-\d{2})?$/.test(baseName);
        if (!hasTime) {
          // ¿Termina con fecha YYYY-MM-DD?
          const endsWithDate = /_\d{4}-\d{2}-\d{2}$/.test(baseName);
          if (endsWithDate) {
            baseName = `${baseName}_${getHondurasTimeForFileName()}`;
          } else {
            baseName = `${baseName}_${getHondurasFileNameTimestamp()}`;
          }
        }
      }

      const secureFileName = `${baseName}.xlsx`;

      // 5. Crear una Hoja (Worksheet) a partir del arreglo de Json (data)
      const worksheet = XLSX.utils.json_to_sheet(data);

      // 6. Crear el Libro de Excel (Workbook) y adjuntar la Hoja
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

      // 7. Generar el archivo y accionar la descarga en el navegador con un solo método
      XLSX.writeFile(workbook, secureFileName);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
    }
  }, []);

  return { exportToExcel };
}
