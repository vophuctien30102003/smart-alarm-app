import { ThemeColors } from "@/prototype/interfaces";
import { useColorScheme } from "react-native";

export const useThemeColor = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors: ThemeColors = {
    primary: "#FF8C00",
    secondary: "#FFA500", 
    background: isDark ? "#000000" : "#FFFFFF",
    surface: isDark ? "#1F1F1F" : "#F8F9FA",
    text: isDark ? "#888888" : "#000000",
    textSecondary: isDark ? "#CCCCCC" : "#666666",
    border: isDark ? "#333333" : "#E0E0E0",
    success: "#10B981",
    warning: "#F59E0B", 
    error: "#EF4444",
  };

  return {
    isDark,
    colors,
    colorScheme,
  };
};

export const useTheme = useThemeColor;
