import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker, type Matcher } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { formatLocalDate, getDatePopoverPosition, parseLocalDate } from './dateFieldUtils';

interface DatePickerPopoverProps {
  label: string;
  value: string;
  min?: string;
  max?: string;
  yearNavigation?: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onChange: (value: string) => void;
  onClear?: () => void;
  onClose: (restoreFocus: boolean) => void;
}

export default function DatePickerPopover({
  label, value, min, max, yearNavigation, triggerRef, onChange, onClear, onClose,
}: DatePickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8, ready: false });
  const selected = parseLocalDate(value);
  const minDate = parseLocalDate(min);
  const maxDate = parseLocalDate(max);
  const disabled: Matcher[] = [];
  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });

  const reposition = useCallback(() => {
    const anchor = triggerRef.current?.getBoundingClientRect();
    const popover = popoverRef.current?.getBoundingClientRect();
    if (!anchor || !popover) return;
    setPosition({ ...getDatePopoverPosition(anchor, popover, {
      width: window.innerWidth,
      height: window.innerHeight,
    }), ready: true });
  }, [triggerRef]);

  useLayoutEffect(() => {
    const initialFrame = requestAnimationFrame(reposition);
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!popoverRef.current?.contains(target) && !triggerRef.current?.contains(target)) onClose(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose(true);
      }
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, { capture: true, passive: true });
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, reposition, triggerRef]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-label={`Calendario para ${label.toLocaleLowerCase('es-MX')}`}
      className="date-picker-popover"
      style={{ left: position.left, top: position.top, visibility: position.ready ? 'visible' : 'hidden' }}
    >
      <DayPicker
        className="date-picker"
        mode="single"
        locale={es}
        weekStartsOn={0}
        navLayout="around"
        captionLayout={yearNavigation ? 'dropdown' : 'label'}
        reverseYears={yearNavigation}
        autoFocus
        selected={selected}
        defaultMonth={selected ?? minDate ?? maxDate}
        startMonth={minDate ?? (yearNavigation ? new Date(1900, 0) : undefined)}
        endMonth={maxDate ?? (yearNavigation ? new Date() : undefined)}
        disabled={disabled}
        showOutsideDays
        onSelect={(date) => {
          if (!date) return;
          onChange(formatLocalDate(date));
          onClose(true);
        }}
      />
      {onClear && (
        <button type="button" className="date-picker-clear material-focus" onClick={onClear}>
          Limpiar fecha
        </button>
      )}
    </div>,
    document.body,
  );
}
