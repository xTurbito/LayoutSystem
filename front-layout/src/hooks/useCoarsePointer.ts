import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

const query = typeof window === 'undefined' || !window.matchMedia
  ? null
  : window.matchMedia('(pointer: coarse)');

function subscribe(onChange: () => void) {
  return subscribeToMediaQuery(query, onChange);
}

export function subscribeToMediaQuery(mediaQuery: MediaQueryList | null, onChange: () => void) {
  if (typeof mediaQuery?.addEventListener === 'function') {
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener?.('change', onChange);
  }
  mediaQuery?.addListener?.(onChange);
  return () => mediaQuery?.removeListener?.(onChange);
}

export function useCoarsePointer(onPointerChange?: () => void) {
  const onPointerChangeRef = useRef(onPointerChange);
  useEffect(() => {
    onPointerChangeRef.current = onPointerChange;
  }, [onPointerChange]);
  const subscribeWithPointerChange = useCallback((onStoreChange: () => void) => subscribe(() => {
    onPointerChangeRef.current?.();
    onStoreChange();
  }), []);

  return useSyncExternalStore(subscribeWithPointerChange, () => query?.matches ?? false, () => false);
}
