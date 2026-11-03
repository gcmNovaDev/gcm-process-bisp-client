"use client";
import { useState, useEffect } from "react";

type MonthYearPickerProps = {
  defaultMonth?: number; // 1-12
  defaultYear?: number;
  startYear?: number;
  endYear?: number;
  error?: boolean;
  name?: string;
  classDate?: string;
  allowEmpty?: boolean;
  required?: boolean;
  onChange?: (data: { mes: number | null; anio: number | null }) => void;
};

export default function MonthYearPicker({
  defaultMonth,
  defaultYear,
  startYear = 2000,
  endYear = new Date().getFullYear() + 5,
  error = false,
  name,
  classDate = "",
  allowEmpty = false,
  required = false,
  onChange,
}: MonthYearPickerProps) {
  const today = new Date();
  const [mes, setMes] = useState<number | null>(
    defaultMonth ?? (allowEmpty ? null : today.getMonth() + 1)
  );
  const [anio, setAnio] = useState<number | null>(
    defaultYear ?? (allowEmpty ? null : today.getFullYear())
  );

  useEffect(() => {
    if (onChange) onChange({ mes, anio });
  }, [mes, anio]);

  const meses = [
    ...(allowEmpty ? [{ value: "", label: "-- Sin mes --" }] : []),
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  const years = [
    ...(allowEmpty ? [{ value: "", label: "-- Sin año --" }] : []),
    ...Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
      value: startYear + i,
      label: String(startYear + i),
    })).reverse(),
  ];

  const baseClasses =
    "form-select rounded-[10px] text-sm placeholder-app-gray-400";

  return (
    <div className="flex gap-6">
      {/* Mes */}
      <div className="flex flex-col flex-1">
        <label
          className={`block text-sm font-normal mb-1 ${
            error ? "text-danger" : "text-app-gray-700 dark:text-app-gray-500"
          }`}
        >
          Mes {required && <span className="text-danger">*</span>}
        </label>
        <select
          name={name ? `${name}_mes` : undefined}
          className={`${baseClasses} w-full ${
            error
              ? "!border-danger text-danger"
              : "!border-app-gray-200 text-app-gray-900"
          } ${classDate}`}
          value={mes ?? ""}
          onChange={(e) =>
            setMes(e.target.value === "" ? null : Number(e.target.value))
          }
        >
          {meses.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Año */}
      <div className="flex flex-col flex-1">
        <label
          className={`block text-sm font-normal mb-1 ${
            error ? "text-danger" : "text-app-gray-700 dark:text-app-gray-500"
          }`}
        >
          Año {required && <span className="text-danger">*</span>}
        </label>
        <select
          name={name ? `${name}_anio` : undefined}
          className={`${baseClasses} w-full ${
            error
              ? "!border-danger text-danger"
              : "!border-app-gray-200 text-app-gray-900"
          } ${classDate}`}
          value={anio ?? ""}
          onChange={(e) =>
            setAnio(e.target.value === "" ? null : Number(e.target.value))
          }
        >
          {years.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}