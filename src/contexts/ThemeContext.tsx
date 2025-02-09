
import { createContext, useContext, useEffect, useState } from "react";

type Theme = {
  id: string;
  name: string;
  type: 'masculine' | 'feminine';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  stickerColors: {
    mood: {
      happy: string;
      neutral: string;
      sad: string;
      angry: string;
      love: string;
      heartbreak: string;
    };
    energy: {
      energetic: string;
      calm: string;
      productive: string;
      tired: string;
      stressed: string;
      down: string;
    };
  };
};

const themes: Theme[] = [
  // Default dark theme
  {
    id: 'dark',
    name: 'Dark',
    type: 'masculine',
    primaryColor: '#1A1F2C',
    secondaryColor: '#2D3748',
    accentColor: '#4A5568',
    stickerColors: {
      mood: {
        happy: '#48BB78',
        neutral: '#718096',
        sad: '#4299E1',
        angry: '#F56565',
        love: '#ED64A6',
        heartbreak: '#9F7AEA'
      },
      energy: {
        energetic: '#F6AD55',
        calm: '#4FD1C5',
        productive: '#48BB78',
        tired: '#718096',
        stressed: '#F56565',
        down: '#4A5568'
      }
    }
  },
  // Premium Masculine theme - Ocean Depths
  {
    id: 'm1',
    name: 'Ocean Depths',
    type: 'masculine',
    primaryColor: '#1E293B',
    secondaryColor: '#334155',
    accentColor: '#0EA5E9',
    stickerColors: {
      mood: {
        happy: '#38BDF8',
        neutral: '#94A3B8',
        sad: '#0369A1',
        angry: '#EF4444',
        love: '#EC4899',
        heartbreak: '#6366F1'
      },
      energy: {
        energetic: '#F59E0B',
        calm: '#0D9488',
        productive: '#22C55E',
        tired: '#64748B',
        stressed: '#DC2626',
        down: '#1E293B'
      }
    }
  },
  // Premium Feminine theme - Rose Garden
  {
    id: 'f1',
    name: 'Rose Garden',
    type: 'feminine',
    primaryColor: '#FDF2F8',
    secondaryColor: '#FCE7F3',
    accentColor: '#EC4899',
    stickerColors: {
      mood: {
        happy: '#14B8A6',
        neutral: '#8B5CF6',
        sad: '#6366F1',
        angry: '#EF4444',
        love: '#EC4899',
        heartbreak: '#9333EA'
      },
      energy: {
        energetic: '#F59E0B',
        calm: '#8B5CF6',
        productive: '#22C55E',
        tired: '#6B7280',
        stressed: '#EF4444',
        down: '#4C1D95'
      }
    }
  }
];

type ThemeContextType = {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedThemeId = localStorage.getItem('selected-theme');
    return themes.find(theme => theme.id === savedThemeId) || themes[0]; // Default to dark theme
  });

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('selected-theme', themeId);
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', currentTheme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', currentTheme.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', currentTheme.accentColor);
    
    // Set sticker colors as CSS variables
    Object.entries(currentTheme.stickerColors.mood).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--mood-${key}-color`, value);
    });
    Object.entries(currentTheme.stickerColors.energy).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--energy-${key}-color`, value);
    });
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
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

