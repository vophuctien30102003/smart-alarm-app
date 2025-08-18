import { ThemeColors } from '@/prototype/interfaces';
import React, { createContext, ReactNode, useContext } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  colorScheme: ColorSchemeName;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Sử dụng colors từ GluestackUI theme
  const colors: ThemeColors = {
    primary: isDark ? '#FF8A50' : '#FF6600',
    secondary: isDark ? '#374151' : '#F3F4F6',
    background: isDark ? '#111827' : '#FFFFFF',
    surface: isDark ? '#1F2937' : '#F9FAFB',
    text: isDark ? '#F9FAFB' : '#111827',
    textSecondary: isDark ? '#D1D5DB' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    success: isDark ? '#10B981' : '#059669',
    warning: isDark ? '#F59E0B' : '#D97706',
    error: isDark ? '#EF4444' : '#DC2626',
  };

  const themeData: ThemeContextType = {
    colors,
    isDark,
    colorScheme,
  };
  
  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
