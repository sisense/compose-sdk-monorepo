import { Color } from '../../types';
import { GeoDataElement, RawGeoDataElement } from '../types';
import { createDataColoringFunction } from './create-data-coloring-function.js';

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
