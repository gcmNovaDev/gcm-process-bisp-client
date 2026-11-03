import React from 'react'

export interface SwitchGenericProps {
    label?: string;
    name?: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export const SwitchGeneric: React.FC<SwitchGenericProps> = ({
    label,
    name,
    checked,
    onChange,
    disabled = false,
    ...props
}) => {
    return (
        <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            { }
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only peer"
            />

            { }

            <div className="relative w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-primary-600 
           peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 after:content-[''] after:absolute after:top-[2px] 
           after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
           peer-checked:after:translate-x-full peer-checked:after:border-white"></div>

            {label}
        </label>
    );
};

export default SwitchGeneric;
