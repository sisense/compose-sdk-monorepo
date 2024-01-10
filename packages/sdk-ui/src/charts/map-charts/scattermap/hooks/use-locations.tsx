import { useSisenseContext } from '../../../../sisense-context/sisense-context.js';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Location } from '../types.js';
import { ScattermapLocationLevel } from '../../../../chart-data-options/types.js';
import { getLocationGeoLevel } from '../utils/location.js';
import { ScattermapChartLocation } from '../../../../chart-data/types';

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

export const useLocations = (
  locations: ScattermapChartLocation[],
  locationLevel: ScattermapLocationLevel,
): ScattermapChartLocation[] => {
  const { app } = useSisenseContext();
  const [locationsWithCoordinates, setLocationsWithCoordinates] = useState<
    ScattermapChartLocation[]
  >([]);
  const currentLocations = useRef(locations);

  const getLocations = useCallback(async () => {
    if (!app || !locations) return;

    const encodedWordsMap = {};
    const geoLevel = getLocationGeoLevel(locationLevel);
    const locationsResponse: Location[] = await app.httpClient.post('api/v1/geo/locations', {
      locations: locations.map((location) => ({
        name: encodeNotSupportedLocationName(location.name, encodedWordsMap),
      })),
      ...(geoLevel && { geoLevel }),
    });

    const shouldSkipOutdatedResponse = currentLocations.current !== locations;
    if (!locationsResponse || shouldSkipOutdatedResponse) {
      return;
    }

    const responseMap = locationsResponse.reduce((acc, location) => {
      const decodedLocation = {
        ...location,
        name: decodeNotSupportedLocationName(location.name, encodedWordsMap),
      };
      acc[decodedLocation.name] = decodedLocation;
      return acc;
    }, {});

    const notFoundCoordinates: string[] = [];
    const result = locations.map((location) => {
      if (!responseMap[location.name]) notFoundCoordinates.push(location.name);
      return {
        ...location,
        ...(responseMap[location.name] ? { coordinates: responseMap[location.name].latLng } : null),
      };
    });

    if (notFoundCoordinates.length) {
      console.warn(`Locations "${notFoundCoordinates.join(', ')}" coordinates not found`);
    }
    setLocationsWithCoordinates(result);
  }, [app, setLocationsWithCoordinates, locations, locationLevel]);

  useEffect(() => {
    if (locations) {
      currentLocations.current = locations;
      getLocations();
    }
  }, [locations, app, getLocations]);

  return locationsWithCoordinates;
};
