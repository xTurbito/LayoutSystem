export const PALETTE_STORAGE_KEY = 'layout-palette:v1';

export interface PaletteDef {
  label: string;
  swatch: string;
}

// "gris" es el default: no tiene bloque de override en index.css porque ya
// coincide con los valores base de --color-primary del @theme. Su swatch usa
// ese mismo color para que el selector refleje el acento real, no un gris literal.
export const PALETTES = {
  gris: { label: 'Gris', swatch: '#1e293b' },
  negro: { label: 'Negro', swatch: '#171717' },
  rojo: { label: 'Rojo', swatch: '#dc2626' },
  naranja: { label: 'Naranja', swatch: '#ea580c' },
  verde: { label: 'Verde', swatch: '#16a34a' },
  azul: { label: 'Azul', swatch: '#2563eb' },
  indigo: { label: 'Índigo', swatch: '#4f46e5' },
  morado: { label: 'Morado', swatch: '#7c3aed' },
  magenta: { label: 'Magenta', swatch: '#c026d3' },
  rosa: { label: 'Rosa', swatch: '#db2777' },
} as const satisfies Record<string, PaletteDef>;

export type PaletteId = keyof typeof PALETTES;
type PaletteStorage = Pick<Storage, 'getItem' | 'setItem'>;
type GetPaletteStorage = () => PaletteStorage | undefined;

const getBrowserStorage: GetPaletteStorage = () => window.localStorage;

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === 'string' && value in PALETTES;
}

export function readPalette(getStorage: GetPaletteStorage = getBrowserStorage): PaletteId {
  try {
    const value = getStorage()?.getItem(PALETTE_STORAGE_KEY);
    return isPaletteId(value) ? value : 'gris';
  } catch {
    return 'gris';
  }
}

export function writePalette(
  palette: PaletteId,
  getStorage: GetPaletteStorage = getBrowserStorage,
) {
  try {
    getStorage()?.setItem(PALETTE_STORAGE_KEY, palette);
  } catch {
    // La paleta elegida sigue aplicando en esta sesión aunque no se pueda persistir.
  }
}
