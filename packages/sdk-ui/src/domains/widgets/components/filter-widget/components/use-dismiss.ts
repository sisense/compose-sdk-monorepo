import { useEffect, useRef } from 'react';

/**
 * Every overlay currently listening, oldest last-in-stack. Escape acts on the final
 * entry only.
 */
const openOverlays: object[] = [];

/**
 * Closes an overlay on an outside pointer-down or on Escape.
 *
 * **Escape closes the innermost overlay only.** Overlays nest — the date panel's
 * level screen sits inside the panel — and both would otherwise hear the same
 * document keydown and close together, collapsing the whole stack on one press.
 * Subscription order cannot settle it: the outer overlay subscribed first, so it
 * would run first. Hence the explicit stack.
 *
 * A pointer-down needs no such care. The outer overlay contains the inner one, so a
 * click inside the inner is inside both, and a click in the panel but outside the
 * screen is outside only the screen — containment already says which to close.
 * @param active - Whether the overlay is open and should listen
 * @param onDismiss - Called when the overlay should close
 * @returns `anchorRef` for the control, and `overlayRef` for the panel it opens
 * @internal
 */
export function useDismiss<T extends HTMLElement>(active: boolean, onDismiss: () => void) {
  const anchorRef = useRef<T>(null);
  /**
   * The panel is rendered in a portal, so it is nowhere near the anchor in the DOM and
   * containment against the anchor alone would call every click inside the panel an
   * outside click — dismissing it the instant a reader touched it.
   */
  const overlayRef = useRef<HTMLDivElement>(null);
  const token = useRef({}).current;
  /* Read through a ref so the effect below depends on `active` alone. Keying it on the
     callback too meant a caller passing a fresh closure each render popped and re-pushed the
     token, moving this overlay to the top of the stack and handing it an Escape meant for the
     one actually opened last. */
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!active) {
      return;
    }
    openOverlays.push(token);

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || overlayRef.current?.contains(target)) {
        return;
      }
      onDismissRef.current();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || openOverlays[openOverlays.length - 1] !== token) {
        return;
      }
      onDismissRef.current();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      const at = openOverlays.indexOf(token);
      if (at !== -1) {
        openOverlays.splice(at, 1);
      }
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active, token]);

  return { anchorRef, overlayRef };
}
