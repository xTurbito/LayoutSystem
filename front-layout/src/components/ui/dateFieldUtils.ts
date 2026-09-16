const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseLocalDate(value?: string): Date | undefined {
  const match = value?.match(DATE_ONLY);
  if (!match) return undefined;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

export function formatLocalDate(date?: Date): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function canClearDate(value: string, clearable?: boolean, disabled?: boolean) {
  return Boolean(value && clearable && !disabled);
}

export function acceptsDateChange(value: string, clearable?: boolean) {
  return value !== '' || Boolean(clearable);
}

interface PopoverAnchor {
  left: number;
  right?: number;
  top: number;
  bottom: number;
}

export function getDatePopoverPosition(
  anchor: PopoverAnchor,
  popover: { width: number; height: number },
  viewport: { width: number; height: number },
  align: 'start' | 'end' = 'start',
) {
  const margin = 8;
  const gap = 6;
  const maxLeft = Math.max(margin, viewport.width - popover.width - margin);
  const idealLeft = align === 'end' && anchor.right !== undefined ? anchor.right - popover.width : anchor.left;
  const left = Math.min(Math.max(idealLeft, margin), maxLeft);
  const below = anchor.bottom + gap;
  const preferredTop = below + popover.height <= viewport.height - margin
    ? below
    : anchor.top - popover.height - gap;
  const maxTop = Math.max(margin, viewport.height - popover.height - margin);
  const top = Math.min(Math.max(preferredTop, margin), maxTop);

  return { left, top };
}
