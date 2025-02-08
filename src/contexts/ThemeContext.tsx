
import { createContext, useContext, useEffect, useState } from "react";

type Theme = {
  id: string;
  name: string;
  type: 'masculine' | 'feminine';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

const themes: Theme[] = [
  // Masculine themes
  {
    id: 'm1',
    name: 'Forest',
    type: 'masculine',
    primaryColor: '#2D3A3A',
    secondaryColor: '#4A5859',
    accentColor: '#8FAD88'
  },
  {
    id: 'm2',
    name: 'Ocean',
    type: 'masculine',
    primaryColor: '#1B2A41',
    secondaryColor: '#324A5F',
    accentColor: '#5C829A'
  },
  {
    id: 'm3',
    name: 'Mountain',
    type: 'masculine',
    primaryColor: '#2B2D42',
    secondaryColor: '#4A4E69',
    accentColor: '#9A8C98'
  },
  {
    id: 'm4',
    name: 'Desert',
    type: 'masculine',
    primaryColor: '#4A4238',
    secondaryColor: '#7A6C5D',
    accentColor: '#C2A878'
  },
  {
    id: 'm5',
    name: 'Urban',
    type: 'masculine',
    primaryColor: '#2B2D42',
    secondaryColor: '#3D3D3D',
    accentColor: '#666666'
  },
  {
    id: 'm6',
    name: 'Tech',
    type: 'masculine',
    primaryColor: '#1A1B26',
    secondaryColor: '#2E3440',
    accentColor: '#5E81AC'
  },
  // Feminine themes
  {
    id: 'f1',
    name: 'Rose Garden',
    type: 'feminine',
    primaryColor: '#FFE5E5',
    secondaryColor: '#FFC4C4',
    accentColor: '#FF9F9F'
  },
  {
    id: 'f2',
    name: 'Lavender',
    type: 'feminine',
    primaryColor: '#E6E6FA',
    secondaryColor: '#D8BFD8',
    accentColor: '#DDA0DD'
  },
  {
    id: 'f3',
    name: 'Mint',
    type: 'feminine',
    primaryColor: '#E0F2F1',
    secondaryColor: '#B2DFDB',
    accentColor: '#80CBC4'
  },
  {
    id: 'f4',
    name: 'Coral',
    type: 'feminine',
    primaryColor: '#FFE8DF',
    secondaryColor: '#FFCDB2',
    accentColor: '#FFB4A2'
  },
  {
    id: 'f5',
    name: 'Sky',
    type: 'feminine',
    primaryColor: '#E3F2FD',
    secondaryColor: '#BBDEFB',
    accentColor: '#90CAF9'
  },
  {
    id: 'f6',
    name: 'Sunset',
    type: 'feminine',
    primaryColor: '#FFF3E0',
    secondaryColor: '#FFE0B2',
    accentColor: '#FFCC80'
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
    return themes.find(theme => theme.id === savedThemeId) || themes[0];
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
