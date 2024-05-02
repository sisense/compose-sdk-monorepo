import trim from 'lodash/trim';
import { ScattermapLocationLevel } from '@/chart-data-options/types';
import { ScattermapDataPoint } from '@/types';
import { ScattermapChartLocation } from '@/chart-data/types';

export const LOCATION_DELIMITER = ',';

export function combineLocationNames(names: string[]) {
  return names.join(`${LOCATION_DELIMITER} `);
}

export function splitLocationName(combinedLocation: string) {
  return combinedLocation.split(LOCATION_DELIMITER).map(trim);
}

export function getLocationGeoLevel(level: ScattermapLocationLevel) {
  switch (level) {
    case 'city':
      return 'city';
    case 'state':
      return 'adm';
    case 'country':
      return 'country';
  }

  return undefined;
}

export function locationToScattermapDataPoint(
  location: ScattermapChartLocation,
): ScattermapDataPoint {
  const { name, rawName, coordinates, value } = location;

  return {
    categories: rawName,
    displayName: name,
    coordinates: {
      lat: coordinates!.lat,
      lng: coordinates!.lng,
    },
    value,
  };
}
