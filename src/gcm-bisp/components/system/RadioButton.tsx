import React, { forwardRef } from 'react';

interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ label, id, className, ...props }, ref) => {
    const inputId = id || `radio-button-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className={`flex items-center gap-2 ${className || ''}`}>
        <div className="relative flex items-center">
          <input
            type="radio"
            id={inputId}
            ref={ref}
            className="peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-app-gray-300 transition-all checked:border-primary-600 hover:border-primary-400 dark:border-slate-600 dark:checked:border-primary-500"
            {...props}
          />
          {/* Círculo interno que aparece al ser seleccionado */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary-600 dark:bg-primary-500 opacity-0 transition-opacity peer-checked:opacity-100"></div>
        </div>
        <label htmlFor={inputId} className="cursor-pointer text-sm font-medium text-app-gray-900 dark:text-app-gray-100 select-none">
          {label}
        </label>
      </div>
    );
  }
);

RadioButton.displayName = 'RadioButton';
export default RadioButton;
