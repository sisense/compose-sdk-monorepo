import { type RefObject, useEffect } from 'react';

/**
 * Blurs the given element when a pointerdown occurs outside it.
 * Used to commit inline editors when the user clicks on elements that call
 * preventDefault() on mousedown (e.g. chart libraries), so the browser never fires blur.
 *
 * @param elementRef - Ref to the element that should lose focus on outside pointerdown
 * @param isActive - When true, the document listener is attached; when false, it is removed
 * @internal
 */
export function useBlurOnPointerDownOutside(
  elementRef: RefObject<HTMLElement | null>,
  isActive: boolean,
): void {
  useEffect(() => {
    if (!isActive) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
        elementRef.current.blur();
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [elementRef, isActive]);
}
