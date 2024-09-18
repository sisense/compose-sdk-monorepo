import trim from 'lodash-es/trim';
import {
  ScattermapLocationLevel,
  ScattermapChartDataOptionsInternal,
} from '@/chart-data-options/types';
import { DataPointEntry, ScattermapDataPoint } from '@/types';
import { ScattermapChartLocation } from '@/chart-data/types';
import { getDataPointMetadata } from '@/chart-options-processor/data-points';

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

export function getScattermapDataPoint(
  location: ScattermapChartLocation,
  dataOptions: ScattermapChartDataOptionsInternal,
): ScattermapDataPoint {
  const { name, rawName, coordinates, value, colorValue, details } = location;

  const geoEntries: DataPointEntry[] = dataOptions.locations.map((item, index) => {
    return {
      ...getDataPointMetadata(`geo.${index}`, item),
      value: rawName[index],
    };
  });

  const entries = {
    geo: geoEntries,
  } as NonNullable<ScattermapDataPoint['entries']>;

  if (dataOptions.size) {
    entries.size = {
      ...getDataPointMetadata(`size`, dataOptions.size),
      value: value,
    };
  }

  if (dataOptions.colorBy) {
    entries.colorBy = {
      ...getDataPointMetadata(`colorBy`, dataOptions.colorBy),
      value: colorValue as number,
    };
  }

  if (dataOptions.details) {
    const metadata = getDataPointMetadata(`details`, dataOptions.details);
    // Supports only measure "details" that already part of a map data
    if (metadata.measure) {
      entries.details = {
        ...metadata,
        value: details as number,
      };
    }
  }

  return {
    categories: rawName,
    displayName: name,
    coordinates: {
      lat: coordinates!.lat,
      lng: coordinates!.lng,
    },
    value,
    entries,
  };
}
