import { createContext, use } from 'react';
import type { ResolvedTheme, ThemePreference } from './theme';
import type { PaletteId } from './palette';

export interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  palette: PaletteId;
  setPalette: (palette: PaletteId) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
