import { ScattermapChartLocation } from '../../../../chart-data/types.js';
import { getValuesMinMax } from './values.js';

export function getLocationsMarkerSizes(
  locations: ScattermapChartLocation[],
  minsize = 4,
  maxsize = 24,
): number[] {
  let delta = 0;
  const { min, max } = getValuesMinMax(locations.map(({ value }) => value));
  const sizedelta = maxsize - minsize;

  delta = max - min;

  return locations.map((location) => {
    if (delta === 0) {
      return minsize;
    } else {
      return ((location.value - min) / delta) * sizedelta + minsize;
    }
  });
}
