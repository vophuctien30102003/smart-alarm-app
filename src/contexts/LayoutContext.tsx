import React, { createContext, ReactNode, useContext, useState } from 'react';

export type LayoutType = 'tabs' | 'drawer' | 'stack';
export type ThemeMode = 'light' | 'dark' | 'system';

interface LayoutContextType {
  layoutType: LayoutType;
  setLayoutType: (type: LayoutType) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [layoutType, setLayoutType] = useState<LayoutType>('tabs');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  return (
    <LayoutContext.Provider value={{
      layoutType,
      setLayoutType,
      themeMode,
      setThemeMode,
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
