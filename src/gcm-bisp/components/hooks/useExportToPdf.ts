"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    getHondurasFileNameTimestamp,
    getHondurasTimeForFileName,
    getHondurasFormattedDateTime,
} from "./useHondurasDate";

interface BrandingOptions {
    logo?: string; // Base64 o URL
    companyName?: string;
    reportTitle?: string;
    extraMetrics?: Array<{ label: string, value: string }>;
    secondaryDetails?: Array<{ label: string, value: string }>;
}

interface ExportPdfOptions {
    title?: string;
    orientation?: "portrait" | "landscape";
    pageSize?: "a4" | "letter" | "legal";
    branding?: BrandingOptions;
    autoTimestamp?: boolean;
}

interface ExportPdfParams {
    data: Array<Record<string, any>>;
    fileName: string;
    options?: ExportPdfOptions;
}

/**
 * Función auxiliar para generar nombres de archivo seguros con timestamp de Honduras
 */
const buildSecurePdfFileName = (fileName: string, autoTimestamp = true): string => {
    let baseName = fileName.trim().replace(/\.pdf$/i, "");
    if (autoTimestamp) {
        const hasTime = /_\d{2}-\d{2}(-\d{2})?$/.test(baseName);
        if (!hasTime) {
            const endsWithDate = /_\d{4}-\d{2}-\d{2}$/.test(baseName);
            if (endsWithDate) {
                baseName = `${baseName}_${getHondurasTimeForFileName()}`;
            } else {
                baseName = `${baseName}_${getHondurasFileNameTimestamp()}`;
            }
        }
    }
    return `${baseName}.pdf`;
};

/**
 * Función auxiliar para cargar imágenes de forma asíncrona
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Prevenir problemas de CORS si aplica
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
};

export default function useExportToPdf() {
    const exportToPdf = useCallback(async ({ data, fileName, options }: ExportPdfParams) => {
        // 1. Manejo de caso: Data vacía o nula
        if (!data || data.length === 0) {
            console.warn("No hay datos para exportar a PDF.");
            return;
        }

        // 2. Manejo de caso: Nombres de archivo inválidos
        if (!fileName || fileName.trim() === "") {
            console.warn("El nombre de archivo es inválido.");
            return;
        }

        try {
            const autoTimestamp = options?.autoTimestamp ?? true;
            const secureFileName = buildSecurePdfFileName(fileName, autoTimestamp);

            const orientation = options?.orientation || "portrait";
            const pageSize = options?.pageSize || "a4";

            const doc = new jsPDF({
                orientation,
                unit: "mm",
                format: pageSize,
            });

            let startY = 15;

            // 3. Renderizar Branding si existe
            if (options?.branding) {
                const { logo, companyName, reportTitle, extraMetrics, secondaryDetails } = options.branding;

                // Logo asíncrono
                if (logo) {
                    try {
                        const img = await loadImage(logo);
                        doc.addImage(img, "PNG", 14, 10, 40, 15);
                    } catch (e) {
                        console.error("Error cargando el logo para el PDF:", e);
                        // Continuamos sin logo si falla la carga
                    }
                }

                // Company & Title
                doc.setTextColor(40, 40, 40);
                if (companyName) {
                    doc.setFontSize(16);
                    doc.setFont("helvetica", "bold");
                    doc.text(companyName.toUpperCase(), 60, 18);
                }

                if (reportTitle) {
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(100, 100, 100);
                    doc.text(reportTitle, 60, 24);
                }

                // Detalles Secundarios (Filtros, Fechas, etc)
                const emissionTimeStr = getHondurasFormattedDateTime();
                if (secondaryDetails && secondaryDetails.length > 0) {
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(120, 120, 120);
                    const hasEmision = secondaryDetails.some(d =>
                        d.label.toLowerCase().includes("emisi") || d.label.toLowerCase().includes("generad")
                    );
                    const detailsToRender = hasEmision
                        ? secondaryDetails
                        : [...secondaryDetails, { label: "Emisión", value: emissionTimeStr }];
                    const detailsStr = detailsToRender.map(d => `${d.label}${d.label ? ': ' : ''}${d.value}`).join("  |  ");
                    doc.text(detailsStr, 60, 28);
                } else {
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(120, 120, 120);
                    doc.text(`Emisión: ${emissionTimeStr}`, 60, 28);
                }

                // Línea Separadora
                doc.setDrawColor(200, 200, 200);
                doc.line(14, 30, doc.internal.pageSize.getWidth() - 14, 30);

                // Cuadro de Resumen / Métricas
                if (extraMetrics && extraMetrics.length > 0) {
                    const itemsPerRow = 4;
                    const rowCount = Math.ceil(extraMetrics.length / itemsPerRow);
                    const boxHeight = rowCount * 18;

                    startY = 35;
                    doc.setFillColor(245, 247, 251);
                    doc.rect(14, startY, doc.internal.pageSize.getWidth() - 28, boxHeight, "F");

                    doc.setFontSize(9);
                    doc.setTextColor(60, 60, 60);

                    const spacing = (doc.internal.pageSize.getWidth() - 40) / itemsPerRow;

                    extraMetrics.forEach((metric, index) => {
                        const row = Math.floor(index / itemsPerRow);
                        const col = index % itemsPerRow;
                        const x = 20 + (col * spacing);
                        const y = startY + 8 + (row * 14);

                        doc.setFont("helvetica", "bold");
                        doc.text(metric.label.toUpperCase(), x, y);
                        doc.setFont("helvetica", "normal");
                        doc.text(metric.value, x, y + 6);
                    });

                    startY += boxHeight + 8;
                } else {
                    startY = 35;
                }
            } else if (options?.title) {
                // Título Simple Legacy
                doc.setFontSize(14);
                doc.text(options.title, 14, 15);
                startY = 25;
            }

            // 4. Preparar datos para la tabla
            const headers = Object.keys(data[0]);
            const body = data.map((item) =>
                headers.map((key) => {
                    const value = item[key];
                    return value !== null && value !== undefined ? String(value) : "";
                })
            );

            // 5. Generar Tabla
            autoTable(doc, {
                head: [headers],
                body: body,
                startY: startY,
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: {
                    fillColor: [51, 65, 85], // Slate 700
                    textColor: 255,
                    fontStyle: "bold",
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { horizontal: 14 },
                didDrawPage: (data) => {
                    // Footer: Página X y Fecha/Hora exacta en Honduras
                    const pageSize = doc.internal.pageSize;
                    const pageHeight = pageSize.height;
                    const pageWidth = pageSize.width;

                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(
                        `Página ${data.pageNumber}`,
                        14,
                        pageHeight - 10
                    );
                    doc.text(
                        `Generado el: ${getHondurasFormattedDateTime()}`,
                        pageWidth - 14,
                        pageHeight - 10,
                        { align: "right" }
                    );
                }
            });

            doc.save(secureFileName);
        } catch (error) {
            console.error("Error al exportar a PDF:", error);
        }
    }, []);

    const exportConsolidatedDailyProductionPdf = useCallback(async ({
        data,
        fileName,
        filters
    }: {
        data: any;
        fileName: string;
        filters: {
            fechaInicio: string;
            fechaFinal: string;
            turnoStr: string;
            lineaStr: string;
            responsable: string;
        };
    }) => {
        if (!data) return;

        try {
            const secureFileName = buildSecurePdfFileName(fileName);
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "letter",
            });

            // Load Logo on Top Right
            try {
                const img = await loadImage("/Logo/NOVA_Logo.png");
                doc.addImage(img, "PNG", doc.internal.pageSize.width - 54, 10, 40, 10);
            } catch (e) {
                console.error("Error cargando el logo para el PDF:", e);
            }

            let currentY = 18;

            // 1. Título Principal
            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("REPORTE DE PRODUCCION AREA CLASIFICADO", 14, currentY);
            currentY += 8;

            // Helpers to format numbers locally
            const formatNum = (num: number | null | undefined) => {
                if (num === null || num === undefined) return "";
                return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
            };

            const formatInt = (num: number | null | undefined) => {
                if (num === null || num === undefined) return "";
                return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);
            };

            // 2. Datos de Producción (Metadatos Table)
            const fechaVal = filters.fechaInicio === filters.fechaFinal
                ? filters.fechaInicio
                : `${filters.fechaInicio} a ${filters.fechaFinal}`;

            autoTable(doc, {
                startY: currentY,
                theme: "grid",
                styles: { fontSize: 8.5, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
                head: [[
                    { content: "Datos de Producción", colSpan: 3, styles: { fontStyle: "bold", fillColor: [245, 245, 245], textColor: [0, 0, 0] } }
                ]],
                body: [
                    [
                        { content: "Fecha:", styles: { fontStyle: "bold" } },
                        { content: "Turno:", styles: { fontStyle: "bold" } },
                        { content: "línea de producción:", styles: { fontStyle: "bold" } }
                    ],
                    [
                        fechaVal,
                        filters.turnoStr || "Todos",
                        filters.lineaStr || "Todas"
                    ],
                    [
                        { content: "Responsable:", styles: { fontStyle: "bold" } },
                        { content: filters.responsable || "Sistema GCM" },
                        { content: `Emisión: ${getHondurasFormattedDateTime()}`, styles: { fontStyle: "italic", halign: "right" } }
                    ]
                ],
                margin: { left: 14, right: 14 }
            });
            currentY = (doc as any).lastAutoTable.finalY + 6;

            // 3. Resumen Producción
            const summary = data.resumenEjecutivo?.[0] || {};
            autoTable(doc, {
                startY: currentY,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0], halign: "center" },
                head: [[
                    { content: "Resumen Producción:", colSpan: 8, styles: { fontStyle: "bold", halign: "left", fillColor: [245, 245, 245], fontSize: 8.5, textColor: [0, 0, 0] } }
                ]],
                body: [
                    [
                        { content: "Libras:", styles: { fontStyle: "bold" } },
                        { content: "Bines:", styles: { fontStyle: "bold" } },
                        { content: "Remisiones:", styles: { fontStyle: "bold" } },
                        { content: "Entero:", styles: { fontStyle: "bold" } },
                        { content: "Cola:", styles: { fontStyle: "bold" } },
                        { content: "Rechazo:", styles: { fontStyle: "bold" } },
                        { content: "Reproceso:", styles: { fontStyle: "bold" } },
                        { content: "Pendientes:", styles: { fontStyle: "bold" } }
                    ],
                    [
                        formatNum(summary.LibrasClasificadas),
                        formatInt(summary.BinesClasificados),
                        formatInt(summary.RemisionesProcesadas),
                        formatNum(summary.LibrasEntero),
                        formatNum(summary.LibrasCola),
                        formatNum(summary.LibrasRechazo),
                        formatNum(summary.LibrasReproceso),
                        formatNum(summary.LibrasPendientes)
                    ]
                ],
                margin: { left: 14, right: 14 }
            });
            currentY = (doc as any).lastAutoTable.finalY + 6;

            // 4. Remisiones Procesadas
            const totalsRemision = (data.produccionPorRemision || []).reduce(
                (acc: any, curr: any) => ({
                    bines: acc.bines + (curr.Bines || 0),
                    libras: acc.libras + (curr.Libras || 0),
                }),
                { bines: 0, libras: 0 }
            );

            const remisionBody = (data.produccionPorRemision || []).map((r: any) => [
                r.Remision || "",
                r.Cliente || "-",
                r.Finca || "-",
                r.Laguna || "-",
                formatInt(r.Bines),
                formatNum(r.Libras)
            ]);

            if (remisionBody.length > 0) {
                remisionBody.push([
                    { content: "TOTAL GENERAL", colSpan: 4, styles: { fontStyle: "bold" } },
                    { content: formatInt(totalsRemision.bines), styles: { fontStyle: "bold", halign: "center" } },
                    { content: formatNum(totalsRemision.libras), styles: { fontStyle: "bold", halign: "right" } }
                ]);
            }

            autoTable(doc, {
                startY: currentY,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
                headStyles: {
                    fillColor: [245, 245, 245],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                },
                head: [
                    [{ content: "Remisiones Procesadas", colSpan: 6, styles: { fontStyle: "bold", fillColor: [245, 245, 245], fontSize: 8.5 } }],
                    ["Remisión:", "Cliente:", "Finca:", "Laguna:", "Bines:", "Libras:"]
                ],
                body: remisionBody,
                columnStyles: {
                    0: { fontStyle: "bold" },
                    4: { halign: "center" },
                    5: { halign: "right" }
                },
                margin: { left: 14, right: 14 }
            });
            currentY = (doc as any).lastAutoTable.finalY + 6;

            // 5. Producción por Talla
            const totalsTalla = (data.produccionPorTalla || []).reduce(
                (acc: any, curr: any) => ({
                    bines: acc.bines + (curr.Bines || 0),
                    libras: acc.libras + (curr.Libras || 0),
                }),
                { bines: 0, libras: 0 }
            );

            const tallaBody = (data.produccionPorTalla || []).map((t: any) => [
                t.NOMBRE_TALLA || "",
                formatInt(t.Bines),
                formatNum(t.Libras)
            ]);

            if (tallaBody.length > 0) {
                tallaBody.push([
                    { content: "TOTAL GENERAL", styles: { fontStyle: "bold" } },
                    { content: formatInt(totalsTalla.bines), styles: { fontStyle: "bold", halign: "center" } },
                    { content: formatNum(totalsTalla.libras), styles: { fontStyle: "bold", halign: "right" } }
                ]);
            }

            autoTable(doc, {
                startY: currentY,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
                headStyles: {
                    fillColor: [245, 245, 245],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                },
                head: [
                    [{ content: "Producción por Talla:", colSpan: 3, styles: { fontStyle: "bold", fillColor: [245, 245, 245], fontSize: 8.5 } }],
                    ["Tallas:", "Ctd. Bines:", "Ctd. Libras:"]
                ],
                body: tallaBody,
                columnStyles: {
                    0: { fontStyle: "bold" },
                    1: { halign: "center" },
                    2: { halign: "right" }
                },
                margin: { left: 14, right: 14 }
            });
            currentY = (doc as any).lastAutoTable.finalY + 6;

            // 6. Producción Bines (Resumen de Excepciones)
            autoTable(doc, {
                startY: currentY,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0], halign: "center" },
                headStyles: {
                    fillColor: [245, 245, 245],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                },
                head: [
                    [{ content: "Producción Bines:", colSpan: 8, styles: { fontStyle: "bold", halign: "left", fillColor: [245, 245, 245], fontSize: 8.5 } }],
                    ["Bines:", "Bines/Excepción:", "%Excepción:", "Total/Canastas:", "Canastas/Exec:", "%Canastas/Excepción:", "Lbs. Normales:", "Lbs. Excepción:"]
                ],
                body: (data.resumenExcepciones || []).map((e: any) => [
                    formatInt(e.TotalBines),
                    formatInt(e.BinesConExcepcion),
                    `${e.PorcentajeBinesConExcepcion?.toFixed(2)}%`,
                    formatInt(e.TotalCanastas),
                    formatInt(e.CanastasExcepcion),
                    `${e.PorcentajeCanastasExcepcion?.toFixed(2)}%`,
                    formatNum(e.LibrasNormales),
                    formatNum(e.LibrasExcepcion)
                ]),
                margin: { left: 14, right: 14 }
            });
            currentY = (doc as any).lastAutoTable.finalY + 6;

            // 7. Detalle de Producción por Bin
            autoTable(doc, {
                startY: currentY,
                theme: "grid",
                styles: { fontSize: 7.5, cellPadding: 1.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
                headStyles: {
                    fillColor: [245, 245, 245],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                },
                head: [
                    [{ content: "Detalle de Producción por Bin:", colSpan: 9, styles: { fontStyle: "bold", fillColor: [245, 245, 245], fontSize: 8.5 } }],
                    ["Bin:", "Talla Principal:", "Total Canastas:", "Tiene Excepción:", "Canastas Excepción:", "Lbs. Excepción:", "Lbs. Netas:", "Destino:", "Obs.:"]
                ],
                body: (data.produccionGeneralPorBin || []).map((b: any) => [
                    b.BIN || "",
                    b.TallaPrincipal || "",
                    formatInt(b.TotalCanastas),
                    b.TieneExcepciones === 1 ? "Sí" : "No",
                    formatInt(b.CanastasExcepcion || 0),
                    formatNum(b.LibrasExcepcion || 0),
                    formatNum(b.LibrasNetas),
                    b.DestinoFinal || "",
                    b.ObservacionExcepcion || "-"
                ]),
                columnStyles: {
                    0: { fontStyle: "bold" },
                    2: { halign: "center" },
                    3: { halign: "center" },
                    4: { halign: "center" },
                    5: { halign: "right" },
                    6: { halign: "right" }
                },
                margin: { left: 14, right: 14 }
            });
            currentY = (doc as any).lastAutoTable.finalY + 10;

            // 8. Firmas (Box layout split in half)
            const pageHeight = doc.internal.pageSize.height;
            if (currentY + 25 > pageHeight) {
                doc.addPage();
                currentY = 20;
            }

            autoTable(doc, {
                startY: currentY,
                theme: "grid",
                styles: { fontSize: 9, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
                body: [
                    [
                        { content: "Firma:\n\n\n\n", styles: { minCellHeight: 18, valign: "top" } },
                        { content: "Firma:\n\n\n\n", styles: { minCellHeight: 18, valign: "top" } }
                    ]
                ],
                margin: { left: 14, right: 14 }
            });

            // Numeración de páginas en el pie
            const totalPages = doc.getNumberOfPages();
            const emissionFooter = `Generado el: ${getHondurasFormattedDateTime()}`;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Página ${i} de ${totalPages}`, 14, pageHeight - 10);
                doc.text(emissionFooter, doc.internal.pageSize.width - 14, pageHeight - 10, { align: "right" });
            }

            doc.save(secureFileName);
        } catch (error) {
            console.error("Error al exportar reporte diario consolidado a PDF:", error);
        }
    }, []);

    const exportProductInventoryPdf = useCallback(async ({
        groupedData,
        categoryNames,
        totales,
        filters,
        userName,
        fileName,
    }: {
        groupedData: Record<string, any[]>;
        categoryNames: string[];
        totales: { total_libras: number; total_bines: number };
        filters: {
            FechaDesde: string;
            FechaHasta: string;
            SoloPendientes?: boolean;
        };
        userName?: string;
        fileName?: string;
    }) => {
        if (!categoryNames || categoryNames.length === 0) {
            console.warn("No hay datos de inventario para exportar a PDF.");
            return;
        }

        try {
            const rawFileName = fileName || `Inventario_Producto_${filters.FechaDesde}_${filters.FechaHasta}`;
            const secureFileName = buildSecurePdfFileName(rawFileName);

            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "letter",
            });

            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;

            const formatNum = (val: number | null | undefined) =>
                new Intl.NumberFormat("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

            const formatDateDisplay = (dateStr?: string) => {
                if (!dateStr) return "S/F";
                const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
                const parts = clean.split("-");
                if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                return clean;
            };

            // 1. Encabezado institucional con Logo
            try {
                const img = await loadImage("/Logo/NOVA_Logo.png");
                doc.addImage(img, "PNG", 14, 9, 36, 13);
            } catch (e) {
                console.error("Error cargando logo en exportProductInventoryPdf:", e);
            }

            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 41, 59);
            doc.text("NOVA HONDURAS ZONA LIBRE S.A.", 54, 15);

            doc.setFontSize(9.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(71, 85, 105);
            doc.text("INVENTARIO DE PRODUCTO FRESCO EN PLANTA", 54, 20);

            doc.setFontSize(7.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            const periodStr = `Periodo: ${formatDateDisplay(filters.FechaDesde)} al ${formatDateDisplay(filters.FechaHasta)}   |   Emisión: ${getHondurasFormattedDateTime()}   |   Filtro: ${filters.SoloPendientes ? "Solo Bines Pendientes" : "Todos los Bines"}   |   Generado por: ${userName || "Sistema GCM"}`;
            doc.text(periodStr, 54, 25);

            // Línea divisoria
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.4);
            doc.line(14, 28, pageWidth - 14, 28);

            let currentY = 32;

            // 2. TABLA 1: RESUMEN Y TOTALES POR CATEGORÍA (Lo primero en mostrarse)
            let totalGeneralLbs = 0;
            let totalGeneralBines = 0;
            let totalGeneralRemisiones = 0;

            const categorySummaries = categoryNames.map((cat) => {
                const catItems = groupedData[cat] || [];
                const catLbs = catItems.reduce((sum: number, item: any) => sum + (Number(item.TotalLibras) || 0), 0);
                const catBines = catItems.reduce((sum: number, item: any) => sum + (Number(item.TotalBines) || 0), 0);

                totalGeneralLbs += catLbs;
                totalGeneralBines += catBines;
                totalGeneralRemisiones += catItems.length;

                return {
                    cat,
                    count: catItems.length,
                    bines: catBines,
                    libras: catLbs,
                };
            });

            // Si los totales globales vinieron del backend, usarlos si son consistentes
            if (totales?.total_libras) {
                totalGeneralLbs = totales.total_libras;
            }
            if (totales?.total_bines) {
                totalGeneralBines = totales.total_bines;
            }

            const summaryTableBody: any[] = categorySummaries.map((cs) => {
                const percent = totalGeneralLbs > 0 ? ((cs.libras / totalGeneralLbs) * 100).toFixed(1) + "%" : "0%";
                return [
                    cs.cat,
                    String(cs.count),
                    String(cs.bines),
                    `${formatNum(cs.libras)} lbs`,
                    percent,
                ];
            });

            // Fila de Total General al pie del resumen
            summaryTableBody.push([
                { content: "TOTAL GENERAL CONSOLIDADO", styles: { fontStyle: "bold", fillColor: [241, 245, 249] } },
                { content: String(totalGeneralRemisiones), styles: { fontStyle: "bold", halign: "center", fillColor: [241, 245, 249] } },
                { content: String(totalGeneralBines), styles: { fontStyle: "bold", halign: "center", fillColor: [241, 245, 249] } },
                { content: `${formatNum(totalGeneralLbs)} lbs`, styles: { fontStyle: "bold", halign: "right", textColor: [16, 149, 106], fillColor: [241, 245, 249] } },
                { content: "100%", styles: { fontStyle: "bold", halign: "center", fillColor: [241, 245, 249] } },
            ]);

            autoTable(doc, {
                startY: currentY,
                theme: "grid",
                head: [
                    [
                        {
                            content: "RESUMEN EJECUTIVO - TOTALES POR CATEGORÍA",
                            colSpan: 5,
                            styles: { halign: "left", fontStyle: "bold", fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8.5 },
                        },
                    ],
                    ["CATEGORÍA", "REGISTROS / REMISIONES", "TOTAL BINES", "TOTAL LIBRAS", "% PARTICIPACIÓN"],
                ],
                body: summaryTableBody,
                styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
                headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold", halign: "center" },
                columnStyles: {
                    0: { halign: "left", fontStyle: "bold" },
                    1: { halign: "center" },
                    2: { halign: "center", fontStyle: "bold" },
                    3: { halign: "right", fontStyle: "bold" },
                    4: { halign: "center" },
                },
                margin: { left: 14, right: 14 },
            });

            currentY = (doc as any).lastAutoTable.finalY + 8;

            // 3. TABLAS 2..N: TABLAS DETALLADAS POR CADA CATEGORÍA
            for (const cat of categoryNames) {
                const catItems = groupedData[cat] || [];
                if (catItems.length === 0) continue;

                const catLbs = catItems.reduce((sum: number, item: any) => sum + (Number(item.TotalLibras) || 0), 0);
                const catBines = catItems.reduce((sum: number, item: any) => sum + (Number(item.TotalBines) || 0), 0);

                // Si queda poco espacio vertical en la página actual, saltar a la siguiente
                if (currentY > pageHeight - 38) {
                    doc.addPage();
                    currentY = 15;
                }

                const detailBody: any[] = catItems.map((r: any) => [
                    formatDateDisplay(r.FECHA_REMISION),
                    r.REMISION_GENERAL || "-",
                    `${r.Cliente || "-"} / ${r.Finca || "-"}`,
                    r.Laguna || "-",
                    r.TipoOrigen || "-",
                    r.Proceso || "-",
                    r.Talla || "-",
                    String(r.TotalBines || 0),
                    formatNum(r.TotalLibras || 0),
                    r.PROCESADO ? "PROCESADO" : "PENDIENTE",
                ]);

                // Fila de subtotal para esta categoría
                detailBody.push([
                    { content: `SUBTOTAL ${cat.toUpperCase()}`, colSpan: 7, styles: { fontStyle: "bold", halign: "right", fillColor: [248, 250, 252] } },
                    { content: String(catBines), styles: { fontStyle: "bold", halign: "center", fillColor: [248, 250, 252] } },
                    { content: `${formatNum(catLbs)} lbs`, styles: { fontStyle: "bold", halign: "right", textColor: [16, 149, 106], fillColor: [248, 250, 252] } },
                    { content: "", styles: { fillColor: [248, 250, 252] } },
                ]);

                autoTable(doc, {
                    startY: currentY,
                    theme: "grid",
                    head: [
                        [
                            {
                                content: `${cat.toUpperCase()} (${catItems.length} registros • ${catBines} Bines • ${formatNum(catLbs)} lbs)`,
                                colSpan: 10,
                                styles: { halign: "left", fontStyle: "bold", fillColor: [71, 85, 105], textColor: [255, 255, 255], fontSize: 8 },
                            },
                        ],
                        ["Fecha", "Remisión", "Cliente / Finca", "Laguna", "Origen", "Proceso", "Talla", "Bines", "Libras", "Estado"],
                    ],
                    body: detailBody,
                    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
                    headStyles: { fillColor: [100, 116, 139], textColor: 255, fontStyle: "bold", halign: "center", fontSize: 7.5 },
                    alternateRowStyles: { fillColor: [250, 250, 250] },
                    columnStyles: {
                        0: { halign: "center", cellWidth: 20 },
                        1: { halign: "center", fontStyle: "bold", cellWidth: 24 },
                        2: { halign: "left" },
                        3: { halign: "left", cellWidth: 22 },
                        4: { halign: "center", cellWidth: 22 },
                        5: { halign: "left", cellWidth: 24 },
                        6: { halign: "center", fontStyle: "bold", cellWidth: 16 },
                        7: { halign: "center", fontStyle: "bold", cellWidth: 16 },
                        8: { halign: "right", fontStyle: "bold", cellWidth: 25 },
                        9: { halign: "center", cellWidth: 22 },
                    },
                    margin: { left: 14, right: 14 },
                });

                currentY = (doc as any).lastAutoTable.finalY + 7;
            }

            // 4. Numeración de páginas en el pie
            const totalPages = doc.getNumberOfPages();
            const emissionFooter = `Generado el: ${getHondurasFormattedDateTime()}`;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(7.5);
                doc.setTextColor(148, 163, 184);
                doc.text(`Página ${i} de ${totalPages}`, 14, pageHeight - 8);
                doc.text(emissionFooter, pageWidth - 14, pageHeight - 8, { align: "right" });
            }

            doc.save(secureFileName);
        } catch (error) {
            console.error("Error al exportar inventario de producto a PDF:", error);
        }
    }, []);

    return { exportToPdf, exportConsolidatedDailyProductionPdf, exportProductInventoryPdf };
}
