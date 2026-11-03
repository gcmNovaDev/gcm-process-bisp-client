'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Loader } from '@/gcm-bisp/components/system/Loader';

// Definimos la estructura del Contexto
interface LoaderContextType {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
}

// Creamos el contexto
const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

// Provider que va a envolver la app
export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>('');

  // Función para mostrar el loader, que acepta un mensaje dinámico
  const showLoader = useCallback((newMessage?: string) => {
    setMessage(newMessage);
    setIsVisible(true);
  }, []);

  // Función para ocultar el loader
  const hideLoader = useCallback(() => {
    setIsVisible(false);
    setMessage('');
  }, []);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {/* El componente visual siempre está montado pero se oculta mediante 'isVisible' */}
      <Loader isVisible={isVisible} message={message} />
    </LoaderContext.Provider>
  );
};

// Hook que exportaremos para usar en cualquier componente de la app
export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader debe ser utilizado dentro de un LoaderProvider');
  }
  return context;
};
