
export type Theme = {
  id: string;
  name: string;
  type: 'masculine' | 'feminine';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: {
    from: string;
    to: string;
  };
  pageColors: {
    diary: string;
    budget: string;
    notes: string;
    calendar: string;
    security: string;
    settings: string;
    goals: string;
    medical: string;
  };
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

export type ThemeContextType = {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
  toggleTheme: () => void;
};
