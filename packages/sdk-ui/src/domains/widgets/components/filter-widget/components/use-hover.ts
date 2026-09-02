import { useCallback, useState } from 'react';

/**
 * Tracks the pointer over a control, so it can paint the design's Hover state.
 * @param disabled - A disabled control never reads as hovered
 * @returns The hover flag and the handlers to spread on the element
 * @internal
 */
export function useHover(disabled?: boolean) {
  const [hovered, setHovered] = useState(false);

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);

  return { hovered: hovered && !disabled, handlers: { onMouseEnter, onMouseLeave } } as const;
}
