import { ElementStateColors, ElementStates } from '@/types';

/**
 * Type guard to check if a value is an ElementStateColors object
 *
 * @param value - The value to check
 * @returns True if the value is an ElementStateColors object, false if it's a string
 * @internal
 */
export const isElementStateColors = (
  value: string | ElementStateColors,
): value is ElementStateColors => {
  return typeof value === 'object' && value !== null && 'default' in value;
};

/**
 * @internal
 */
export const getElementStateColor = (
  value: string | ElementStateColors,
  state: ElementStates,
): string => {
  if (!isElementStateColors(value)) {
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
