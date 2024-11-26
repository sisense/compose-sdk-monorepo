import React, { createContext, useContext, useState } from 'react';

interface WidgetErrorsAndWarnings {
  errors: string[];
  warnings: string[];
  setErrors: React.Dispatch<React.SetStateAction<string[]>>;
  setWarnings: React.Dispatch<React.SetStateAction<string[]>>;
  clearError: () => void;
  clearWarning: () => void;
}

const WidgetErrorsAndWarningsContext = createContext<WidgetErrorsAndWarnings | undefined>(
  undefined,
);

export const WidgetErrorsAndWarningsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const clearError = () => setErrors([]);
  const clearWarning = () => setWarnings([]);

  return (
    <WidgetErrorsAndWarningsContext.Provider
      value={{ errors, warnings, clearError, clearWarning, setErrors, setWarnings }}
    >
      {children}
    </WidgetErrorsAndWarningsContext.Provider>
  );
};

export const useWidgetErrorsAndWarnings = () => {
  const context = useContext(WidgetErrorsAndWarningsContext);
  if (!context) {
    // Return default values when the context is not available
    return {
      errors: [],
      warnings: [],
      setErrors: () => {
        console.warn('setErrors called, but context is not available.');
      },
      setWarnings: () => {
        console.warn('setWarnings called, but context is not available.');
      },
      clearError: () => {
        console.warn('clearError called, but context is not available.');
      },
      clearWarning: () => {
        console.warn('clearWarning called, but context is not available.');
      },
    };
  }

  return context;
};
