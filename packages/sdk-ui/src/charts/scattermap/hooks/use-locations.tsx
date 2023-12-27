import { useSisenseContext } from '../../../sisense-context/sisense-context.js';
import { useCallback, useEffect, useState } from 'react';
import { Location } from '../types.js';
import { ScattermapLocationLevel } from '../../../chart-data-options/types.js';
import { getLocationGeoLevel } from '../utils/location.js';

const notSupportedLocationNameEncodeMap = Object.freeze({
  usa: 'united states',
  switzerland: 'switzerland country',
  uk: 'united kingdom',
});

type EncodedWordsMap = {
  [key: string]: string;
};

function encodeNotSupportedLocationName(name: string, encodedWordsMap: EncodedWordsMap): string {
  const encodedName = notSupportedLocationNameEncodeMap[name.toLowerCase()];
  if (encodedName) encodedWordsMap[encodedName] = name;
  return encodedName || name;
}

function decodeNotSupportedLocationName(name: string, encodedWordsMap: EncodedWordsMap): string {
  return encodedWordsMap[name.toLowerCase()] || name;
}

export const useLocations = (locationsNames: string[], locationLevel: ScattermapLocationLevel) => {
  const { app } = useSisenseContext();
  const [locations, setLocations] = useState<Location[] | null>(null);

  const getLocations = useCallback(async () => {
    if (!app) return;

    const encodedWordsMap = {};
    const geoLevel = getLocationGeoLevel(locationLevel);
    const locationsResponse: Location[] = await app.httpClient.post('api/v1/geo/locations', {
      locations: locationsNames.map((name) => ({
        name: encodeNotSupportedLocationName(name, encodedWordsMap),
      })),
      ...(geoLevel && { geoLevel }),
    });
    if (!locationsResponse) return;

    const result = new Array(locationsNames.length);
    const responseMap = locationsResponse.reduce((acc, location) => {
      const decodedLocation = {
        ...location,
        name: decodeNotSupportedLocationName(location.name, encodedWordsMap),
      };
      acc[decodedLocation.name] = decodedLocation;
      return acc;
    }, {});

    locationsNames.forEach((name, index) => {
      if (!responseMap[name]) console.warn(`Location "${name}" coordinates not found`);
      result[index] = responseMap[name] || null;
    });

    setLocations(result);
  }, [app, setLocations, locationsNames, locationLevel]);

  useEffect(() => {
    if (locationsNames) getLocations();
  }, [locationsNames, app, getLocations]);

  return locations;
};
