import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import {
  getSystemPrefersDark,
  getThemeColor,
  readThemePreference,
  resolveTheme,
  resolveThemeStorageChange,
  writeThemePreference,
  type ThemePreference,
} from './theme';
import { readPalette, writePalette, type PaletteId } from './palette';
import { ThemeContext } from './useTheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(readThemePreference);
  const [palette, setPaletteState] = useState(readPalette);
  const [systemDark, setSystemDark] = useState(() =>
    getSystemPrefersDark(typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : undefined),
  );
  const resolvedTheme = resolveTheme(preference, systemDark);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', updateSystemTheme);
    return () => media.removeEventListener('change', updateSystemTheme);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.style.colorScheme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', getThemeColor(resolvedTheme));
  }, [resolvedTheme]);

  useLayoutEffect(() => {
    document.documentElement.dataset.palette = palette;
  }, [palette]);

  useEffect(() => {
    const syncPreference = (event: StorageEvent) => {
      const nextPreference = resolveThemeStorageChange(event.key);
      if (nextPreference) setPreference(nextPreference);
    };

    window.addEventListener('storage', syncPreference);
    return () => window.removeEventListener('storage', syncPreference);
  }, []);

  const updatePreference = (nextPreference: ThemePreference) => {
    writeThemePreference(nextPreference);
    setPreference(nextPreference);
  };

  // A diferencia de AgendaSystem, este acento solo persiste en localStorage
  // (por dispositivo): LayoutSystem es genérico y no asume un endpoint de
  // preferencias de cuenta en el backend. Si un fork lo necesita, puede sumar
  // esa llamada aquí igual que hizo AgendaSystem con authApi.updatePreferences.
  const updatePalette = (nextPalette: PaletteId) => {
    writePalette(nextPalette);
    setPaletteState(nextPalette);
  };

  return (
    <ThemeContext value={{ preference, resolvedTheme, setPreference: updatePreference, palette, setPalette: updatePalette }}>
      {children}
    </ThemeContext>
  );
}
