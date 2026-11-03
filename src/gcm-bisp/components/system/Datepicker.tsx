"use client";

import Flatpickr from "react-flatpickr";
import { Hook, Options } from "flatpickr/dist/types/options";
import { Spanish } from "flatpickr/dist/l10n/es";
import "flatpickr/dist/themes/light.css";
import { getHondurasToday } from "@/gcm-bisp/components/hooks/useHondurasDate";

export default function Datepicker({
  align,
  mode = "single",
  required = false,
  name,
  error = false,
  className = "",
  defaultDateSelected,
  dateFormat = "Y-m-d",
  onChangeDate,
  minDate,
  maxDate,
  radius = "md",
}: {
  align?: "left" | "right";
  mode?: "single" | "range" | "multiple" | "time";
  error?: boolean;
  className?: string;
  defaultDateSelected?: Date | string | (Date | string)[];
  dateFormat?: string;
  name?: string;
  required?: boolean;
  onChangeDate?: (selectedDates: Date[], dateStr: string) => void;
  minDate?: string | Date;
  maxDate?: string | Date;
  radius?: "sm" | "md" | "lg" | "full" | string;
}) {
  const radiusClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const radiusClassOrStyle =
    radiusClasses[radius as keyof typeof radiusClasses];

  const onReady: Hook = (_, dateStr, instance) => {
    (instance.element as HTMLInputElement).value = dateStr.replace("to", "-");

    const customClass = align ?? "";
    instance.calendarContainer.classList.add(`flatpickr-${customClass}`);
  };

  const onChange: Hook = (selectedDates, dateStr, instance) => {
    (instance.element as HTMLInputElement).value = dateStr.replace("to", "-");

    if (onChangeDate) {
      onChangeDate(selectedDates, dateStr);
    }
  };

  const options: Options = {
    mode,
    static: true,
    disableMobile: true,
    dateFormat,
    locale: { ...Spanish },
    monthSelectorType: "dropdown",
    allowInput: true,
    minDate: minDate ?? "1900-01-01",
    maxDate: maxDate ?? "2900-01-01",

    defaultDate:
      defaultDateSelected ??
      getHondurasToday(), // fecha actual de Honduras (UTC-6)

    prevArrow:
      '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
    nextArrow:
      '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',

    onReady,
    onChange,
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <svg
          className={`w-4 h-4 fill-current transition-colors duration-200 ${
            error
              ? "text-alert-error"
              : "text-primary-500 group-focus-within:text-primary-600"
          }`}
          viewBox="0 0 16 16"
        >
          <path d="M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1zm-1 12H2V6h12v8z" />
        </svg>
      </div>

      <Flatpickr
        name={name}
        required={required}
        options={options}
        className={`form-input pl-9 pr-4 py-2 w-full h-[42px] ${
          radiusClassOrStyle || ""
        }
        border ${
          error
            ? "border-alert-error focus:ring-alert-error/20"
            : "border-app-gray-200 focus:border-primary-500 hover:border-primary-400 focus:ring-primary-500/20"
        }
        bg-white text-slate-800 font-medium text-sm
        focus:ring-2 focus:outline-none transition-all duration-200 shadow-sm`}
        style={radiusClassOrStyle ? undefined : { borderRadius: radius }}
      />
    </div>
  );
}