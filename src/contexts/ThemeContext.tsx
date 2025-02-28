
import { createContext, useContext, useEffect, useState } from "react";
import { Theme, ThemeContextType } from "../types/theme";
import { themes } from "../data/themes";

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedThemeId = localStorage.getItem('selected-theme');
    return themes.find(theme => theme.id === savedThemeId) || themes[0];
  });

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('selected-theme', themeId);
    }
  };

  // For backward compatibility with toggleTheme usage
  const toggleTheme = () => {
    const currentThemeType = currentTheme.type;
    const nextTheme = themes.find(theme => theme.type !== currentThemeType) || themes[0];
    setTheme(nextTheme.id);
  };

  useEffect(() => {
    // Set theme colors as CSS custom properties
    document.documentElement.style.setProperty('--background', currentTheme.primaryColor);
    document.documentElement.style.setProperty('--foreground', currentTheme.secondaryColor);
    document.documentElement.style.setProperty('--primary', currentTheme.primaryColor);
    document.documentElement.style.setProperty('--primary-foreground', currentTheme.secondaryColor);
    document.documentElement.style.setProperty('--secondary', currentTheme.secondaryColor);
    document.documentElement.style.setProperty('--secondary-foreground', currentTheme.primaryColor);
    document.documentElement.style.setProperty('--accent', currentTheme.accentColor);
    document.documentElement.style.setProperty('--accent-foreground', currentTheme.primaryColor);
    
    // Set sticker colors
    Object.entries(currentTheme.stickerColors.mood).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--mood-${key}-color`, value);
    });
    Object.entries(currentTheme.stickerColors.energy).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--energy-${key}-color`, value);
    });

    // Ensure we're setting dark mode correctly
    if (currentTheme.type === 'masculine') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes, toggleTheme }}>
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
