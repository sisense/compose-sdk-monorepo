/**
 * Orientation options for the filter tile. The filter tile can
 * be arranged vertically, or horizontally to fit most toolbars.
 */
export type FilterVariant = 'vertical' | 'horizontal';
/**
 * Determines whether the arrangement of the filter menu is vertical.
 *
 * @param arrangement - Arrangement of the filter menu
 * @returns True if the arrangement is vertical, false otherwise
 * @internal
 */
export const isVertical = (arrangement: FilterVariant) => arrangement === 'vertical';
