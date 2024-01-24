import { trim } from 'lodash';
import { ScattermapLocationLevel } from '@/chart-data-options/types';

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
