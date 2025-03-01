
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
    backgroundGradient: {
      from: 'gray-900',
      to: 'gray-800'
    },
    pageColors: {
      diary: '#9b87f5',
      budget: '#22C55E',
      notes: '#8B5CF6',
      calendar: '#3B82F6',
      security: '#4A5568',
      settings: '#9333EA',
      goals: '#F59E0B'
    },
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
  // Premium Feminine theme - Rose Garden
  {
    id: 'f1',
    name: 'Rose Garden',
    type: 'feminine',
    primaryColor: '#FDF2F8',
    secondaryColor: '#FCE7F3',
    accentColor: '#EC4899',
    backgroundGradient: {
      from: 'purple-50',
      to: 'white'
    },
    pageColors: {
      diary: '#FFDEE2',
      budget: '#F2FCE2',
      notes: '#E5DEFF',
      calendar: '#D3E4FD',
      security: '#D3E4FD',
      settings: '#D6BCFA',
      goals: '#FDE1D3'
    },
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
