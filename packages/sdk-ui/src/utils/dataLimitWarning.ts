export const seriesSliceWarning = (seriesLength: number, seriesCapacity: number): string =>
  `Maximum number of series (${seriesCapacity}) exceeded (${seriesLength})`;

export const categoriesSliceWarning = (
  axis: string,
  categoriesLength: number,
  categoriesCapacity: number,
): string =>
  `'${axis.toUpperCase()}-Axis:' Maximum number of categories (${categoriesCapacity}) exceeded (${categoriesLength})`;
