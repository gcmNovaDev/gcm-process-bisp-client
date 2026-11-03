"use client";

import { useState, useMemo } from "react";
import Flatpickr from "react-flatpickr";
import { Hook, Options } from "flatpickr/dist/types/options";
import { Spanish } from "flatpickr/dist/l10n/es";
import "flatpickr/dist/themes/light.css";

interface InputDatepickerProps {
  name: string;
  label?: string; // Por ejemplo: "Fecha Desde:"
  align?: "left" | "right";
  required?: boolean;
  value?: Date | string | (Date | string)[];
  onChangeDate?: (selectedDates: Date[], dateStr: string) => void;
  className?: string;
  error?: boolean;
  minDate?: string | Date;
  maxDate?: string | Date;
  radius?: "sm" | "md" | "lg" | "full" | string;
}

export default function InputDatepicker({
  name,
  label = "Fecha:",
  align = "left",
  required = false,
  value,
  onChangeDate,
  className = "",
  error = false,
  minDate,
  maxDate,
  radius = "md",
}: InputDatepickerProps) {
  // Estado para saber si el usuario ya escogió una fecha y debemos ocultar el "Label"
  const [hasSelectedDate, setHasSelectedDate] = useState(!!value);
  const [isFocused, setIsFocused] = useState(false);

  const onReady: Hook = (selectedDates, dateStr, instance) => {
    (instance.element as HTMLInputElement).value = dateStr;
    instance.calendarContainer.classList.add(`flatpickr-${align}`);
  };

  const onChange: Hook = (selectedDates, dateStr, instance) => {
    (instance.element as HTMLInputElement).value = dateStr;
    setHasSelectedDate(dateStr.length > 0);
    if (onChangeDate) {
      onChangeDate(selectedDates, dateStr);
    }
  };

  const options: Options = useMemo(() => ({
    mode: "single",
    static: false, 
    disableMobile: true,
    dateFormat: "Y-m-d",
    locale: { ...Spanish },
    monthSelectorType: "dropdown",
    allowInput: false, 
    minDate: minDate ?? "1900-01-01",
    maxDate: maxDate ?? "2900-01-01",
  }), [minDate, maxDate]);

  const baseClasses =
    "form-input w-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";

  const sizeClasses = {
    sm: "text-sm py-1 px-2",
    md: "text-base py-2 pl-9 pr-3", // pl-9 to leave room for the calendar icon 
    lg: "text-lg py-3 px-4",
  };

  const radiusClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const radiusClassOrStyle = radiusClasses[radius as keyof typeof radiusClasses]
    ? radiusClasses[radius as keyof typeof radiusClasses]
    : undefined;

  const errorClasses = error
    ? "border-alert-error hover:border-alert-error focus:border-alert-error focus:ring-alert-error"
    : "border-app-gray-1-300 hover:border-app-gray-1-300 focus:border-primary-600 focus:ring-primary-600";

  return (
    <div className={`relative ${className}`}>
      {/* Texto Simulador del Label dentro del input */}
      {!hasSelectedDate && !value && (
        <label
          htmlFor={name}
          className="absolute left-3 text-app-gray-1-500 pointer-events-none flex items-center h-full z-10"
        >
          {label}
        </label>
      )}

      {/* Flatpickr Input */}
      <Flatpickr
        id={name}
        name={name}
        className={`${baseClasses} ${sizeClasses.md} ${radiusClassOrStyle || ""} ${errorClasses} bg-white ${
          hasSelectedDate || value ? "text-app-gray-1-950" : "text-transparent"
        }`}
        style={radiusClassOrStyle ? undefined : { borderRadius: radius }}
        options={options}
        required={required}
        value={value}
        placeholder=""
        onReady={onReady}
        onChange={onChange}
        onOpen={() => setIsFocused(true)}
        onClose={() => setIsFocused(false)}
      />

      {/* Ícono derecho de Calendario */}
      <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none">
        <svg
          className={`w-5 h-5 transition-colors duration-200 ${
            error ? "text-alert-error" : isFocused ? "text-primary-600" : "text-app-gray-1-400"
          }`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1zm-1 12H2V6h12v8z" />
        </svg>
      </div>
    </div>
  );
}
