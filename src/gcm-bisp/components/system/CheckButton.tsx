import React, { forwardRef } from 'react';

interface CheckButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const CheckButton = forwardRef<HTMLInputElement, CheckButtonProps>(
  ({ label, id, className, ...props }, ref) => {
    // Genera un ID automático basado en el label si no se proporciona uno. Útil para enlazar el label con el input.
    const inputId = id || `check-button-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className={`flex items-center gap-2 ${className || ''}`}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            className="peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-app-gray-300 transition-all checked:border-primary-600 checked:bg-primary-600 hover:border-primary-400 dark:border-slate-600 dark:checked:border-primary-500 dark:checked:bg-primary-500"
            {...props}
          />
          {/* Icono de la palomita (Check) que usando la clase 'peer-checked' de tailwind se mostrará al activar el input */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
        <label htmlFor={inputId} className="cursor-pointer text-sm font-medium text-app-gray-900 dark:text-app-gray-100 select-none">
          {label}
        </label>
      </div>
    );
  }
);

CheckButton.displayName = 'CheckButton';
export default CheckButton;
