import React from 'react';
import { useGoBack } from "@/gcm-bisp/components/hooks/useGoBack";
import { ArrowLeft } from "lucide-react";

interface ButtonGoBackProps {
    className?: string;
    onGoBack?: () => void;
}

/**
 * A generic "Go Back" button with a specific outlined style:
 * - White background
 * - accent-600 border
 * - accent-600 text and icon
 * - hover: accent-50 background
 */
export const ButtonGoBack: React.FC<ButtonGoBackProps> = ({ className, onGoBack }) => {
    const { goBack } = useGoBack();
    
    const handleAction = onGoBack || goBack;

    return (
        <button
            onClick={handleAction}
            className={`
                inline-flex items-center justify-center 
                px-8 py-2 
                bg-white 
                border border-accent-600 
                text-accent-600 
                hover:bg-accent-50 
                rounded-[5px] 
                transition-colors 
                h-[42px] 
                whitespace-nowrap 
                font-medium
                ${className || ''}
            `}
        >
            <ArrowLeft size={18} className="mr-2" />
            Volver
        </button>
    );
};

export default ButtonGoBack;
