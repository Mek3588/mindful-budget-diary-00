
import { Theme } from '../types/theme';

export const themes: Theme[] = [
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
