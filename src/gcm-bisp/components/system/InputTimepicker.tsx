"use client";

import { useState, useMemo } from "react";
import Flatpickr from "react-flatpickr";
import { Hook, Options } from "flatpickr/dist/types/options";
import "flatpickr/dist/themes/light.css";

interface InputTimepickerProps {
    name: string;
    label?: string; // Por ejemplo: "Hora:"
    align?: "left" | "right";
    required?: boolean;
    value?: Date | string | (Date | string)[];
    onChangeTime?: (selectedDates: Date[], timeStr: string) => void;
    className?: string;
    error?: boolean;
    radius?: "sm" | "md" | "lg" | "full" | string;
}

export default function InputTimepicker({
    name,
    label = "Hora:",
    align = "left",
    required = false,
    value,
    onChangeTime,
    className = "",
    error = false,
    radius = "md",
}: InputTimepickerProps) {
    // Estado para saber si el usuario ya escogió una hora y debemos ocultar el "Label"
    const [hasSelectedTime, setHasSelectedTime] = useState(!!value);
    const [isFocused, setIsFocused] = useState(false);

    const onReady: Hook = (selectedDates, timeStr, instance) => {
        (instance.element as HTMLInputElement).value = timeStr;
        instance.calendarContainer.classList.add(`flatpickr-${align}`);
    };

    const onChange: Hook = (selectedDates, timeStr, instance) => {
        (instance.element as HTMLInputElement).value = timeStr;
        setHasSelectedTime(timeStr.length > 0);
        if (onChangeTime) {
            onChangeTime(selectedDates, timeStr);
        }
    };

    const options: Options = useMemo(() => ({
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i:s K", // Formato 24 horas "14:30"
        time_24hr: false,
        disableMobile: true,
        allowInput: false,
    }), []);

    const baseClasses =
        "form-input w-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";

    const sizeClasses = {
        sm: "text-sm py-1 px-2",
        md: "text-base py-2 pl-9 pr-3", // pl-9 to leave room for the clock icon 
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
            {!hasSelectedTime && !value && (
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
                className={`${baseClasses} ${sizeClasses.md} ${radiusClassOrStyle || ""} ${errorClasses} bg-white ${hasSelectedTime || value ? "text-app-gray-1-950" : "text-transparent"
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

            {/* Ícono derecho de Reloj */}
            <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none">
                <svg
                    className={`w-5 h-5 transition-colors duration-200 ${error ? "text-alert-error" : isFocused ? "text-primary-600" : "text-app-gray-1-400"
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2400/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
        </div>
    );
}