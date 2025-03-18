import { createDataColoringFunction } from '@/chart-data/data-coloring/create-data-coloring-function';
import { Color } from '@/types';
import { GeoDataElement, RawGeoDataElement } from '../types';

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
