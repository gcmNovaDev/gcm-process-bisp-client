import React, { useState } from 'react';
import ButtonGeneric from "@/gcm-bisp/components/system/ButtonGeneric";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface TabItem {
    id: string;
    title: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

export interface FormTabsProps {
    tabs: TabItem[];
    onSave: () => void;
    onClear?: () => void;
    footerContent?: React.ReactNode;
    saveButtonText?: string;
    clearButtonText?: string;
    className?: string;
}

export default function FormTabs({
    tabs,
    onSave,
    onClear,
    footerContent,
    saveButtonText = "Guardar",
    className = ""
}: FormTabsProps) {
    const [activeTab, setActiveTab] = useState(0);

    const handleNext = () => {
        if (activeTab < tabs.length - 1) setActiveTab(prev => prev + 1);
    };

    const handlePrev = () => {
        if (activeTab > 0) setActiveTab(prev => prev - 1);
    };

    const handleSave = () => {
        onSave();
        // optionally reset to first tab after saving
        setActiveTab(0);
    };

    const handleClear = () => {
        if (onClear) onClear();
        setActiveTab(0);
    };

    return (
        <div className={`flex flex-col w-full bg-white shadow-lg rounded-[20px] border border-slate-200 relative overflow-hidden ${className}`}>
            {/* Top Navigation Menu */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 p-2 px-6 border-b border-slate-200 bg-slate-50">
                {tabs.map((tab, idx) => {
                    const isActive = idx === activeTab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(idx)}
                            className={`
                                flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-t-lg transition-colors border-b-2 
                                ${isActive
                                    ? "bg-white text-primary-600 border-primary-600 shadow-sm"
                                    : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
                                }
                            `}
                        >
                            {tab.icon && <span>{tab.icon}</span>}
                            {tab.title}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="p-6">
                {tabs[activeTab]?.content}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-center p-6 border-t border-slate-200 bg-slate-50">
                {/* Left side of footer (Badge etc) */}
                <div className="flex items-center gap-4">
                    {footerContent}
                </div>

                {/* Right side of footer (Buttons) */}
                <div className="flex items-center gap-3">

                    {activeTab > 0 && (
                        <ButtonGeneric
                            name="Anterior"
                            variant="primary"
                            radius="5px"
                            icon={<ArrowBackIcon className="w-5 h-5 text-white" />}
                            classNameButton="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white whitespace-nowrap h-[42px] leading-none"
                            onClick={handlePrev}
                        />
                    )}

                    {activeTab < tabs.length - 1 ? (
                        <ButtonGeneric
                            name="Siguiente"
                            variant="primary"
                            radius="5px"
                            icon={<ArrowForwardIcon className="w-5 h-5 text-white" />}
                            iconPosition="right"
                            classNameButton="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white whitespace-nowrap h-[42px] leading-none"
                            onClick={handleNext}
                        />
                    ) : (
                        <ButtonGeneric
                            name={saveButtonText}
                            variant="primary"
                            radius="5px"
                            icon={<SaveIcon className="w-5 h-5 text-white" />}
                            classNameButton="px-8 py-2 bg-green-500 hover:bg-green-600 text-white whitespace-nowrap h-[42px] leading-none"
                            onClick={handleSave}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
