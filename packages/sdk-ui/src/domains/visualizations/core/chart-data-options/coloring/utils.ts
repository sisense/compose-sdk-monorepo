import { Color } from '../../../../../types';
import { DEFAULT_PALETTE_COLORS } from './consts';

/**
 * Returns a color from the given palette colors array based on index.
 * If no custom palette supplied, returns a color from the default palette.
 */
export const getPaletteColor = (customPaletteColors: Color[] | undefined, index: number) => {
  const filteredCustomPaletteColors = customPaletteColors?.filter((c) => c) as string[];
  return (
    (filteredCustomPaletteColors &&
      filteredCustomPaletteColors[index % filteredCustomPaletteColors.length]) ??
    DEFAULT_PALETTE_COLORS[index % 10]
  );
};
