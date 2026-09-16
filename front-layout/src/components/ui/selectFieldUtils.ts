export interface SelectFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const SELECT_MENU_PORTAL_Z_INDEX = 1000;

export function getMenuPortalStyle(base: Record<string, unknown>) {
  return { ...base, zIndex: SELECT_MENU_PORTAL_Z_INDEX };
}

export function findSelectedOption(options: SelectFieldOption[], value: string) {
  return options.find((option) => option.value === value) ?? null;
}

export function shouldUseNativeSelect(hasCoarsePointer: boolean) {
  return hasCoarsePointer;
}
