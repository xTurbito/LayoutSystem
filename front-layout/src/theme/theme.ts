export const THEME_STORAGE_KEY = 'layout-theme:v1';
export const THEME_COLORS = { light: '#f8fafc', dark: '#0d1117' } as const;

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;
type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;
type GetThemeStorage = () => ThemeStorage | undefined;
type MatchMedia = (query: string) => Pick<MediaQueryList, 'matches'>;

const getBrowserStorage: GetThemeStorage = () => window.localStorage;

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function getNextThemePreference(preference: ThemePreference): ThemePreference {
  if (preference === 'light') return 'dark';
  if (preference === 'dark') return 'system';
  return 'light';
}

export function readThemePreference(getStorage: GetThemeStorage = getBrowserStorage): ThemePreference {
  try {
    const value = getStorage()?.getItem(THEME_STORAGE_KEY);
    return isThemePreference(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export function writeThemePreference(
  preference: ThemePreference,
  getStorage: GetThemeStorage = getBrowserStorage,
) {
  try {
    getStorage()?.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // El tema elegido sigue aplicando en esta sesión aunque no se pueda persistir.
  }
}

export function resolveThemeStorageChange(
  key: string | null,
  getStorage?: GetThemeStorage,
): ThemePreference | undefined {
  if (key === null) return 'system';
  return key === THEME_STORAGE_KEY ? readThemePreference(getStorage) : undefined;
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemPrefersDark ? 'dark' : 'light') : preference;
}

export function getSystemPrefersDark(matchMedia?: MatchMedia) {
  return matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function getThemeColor(theme: ResolvedTheme) {
  return THEME_COLORS[theme];
}
