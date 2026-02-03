import { createDataColoringFunction } from '@/domains/visualizations/core/chart-data/data-coloring/create-data-coloring-function.js';
import { Color } from '@/types';

import { GeoDataElement, RawGeoDataElement } from '../types.js';

export const geoDataColoringFunction = createDataColoringFunction({
  getValueFromDataStructure: (geoDataElement: RawGeoDataElement) => geoDataElement.originalValue,
  applyColorToDataStructure: (
    rawGeoDataElement: RawGeoDataElement,
    color?: Color,
  ): GeoDataElement => ({
    ...rawGeoDataElement,
    color,
  }),
});
