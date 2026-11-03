import React from 'react';

interface LoaderProps {
  isVisible: boolean;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Animación del Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
      
      {/* Mensaje dinámico opcional */}
      {message && (
        <p className="mt-4 text-lg font-medium text-white drop-shadow-md">
          {message}
        </p>
      )}
    </div>
  );
};
