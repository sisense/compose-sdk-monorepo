import { ElementStateColors, ElementStates } from '@/types';

/**
 * @internal
 */
export const getElementStateColor = (
  value: string | ElementStateColors,
  state: ElementStates,
): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (state === ElementStates.HOVER && value.hover) {
    return value.hover;
  }
  if (state === ElementStates.FOCUS && value.focus) {
    return value.focus;
  }

  return value.default;
};
