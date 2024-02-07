import { FeatureCollection as GeoJsonFeatureCollection } from 'geojson';
import cloneDeep from 'lodash/cloneDeep';
import { useSisenseContext } from '../../../sisense-context/sisense-context';
import { useEffect, useState } from 'react';
import { useGetApi } from '../../../api/rest-api';
import { AreamapType } from '../../../types';

/**
 * Hook to get geoJson from API or cache (LocalStorage)
 */
export const useGeoJson = (
  mapType: AreamapType,
): { geoJson: GeoJsonFeatureCollection | undefined; error: Error | undefined } => {
  const api = useGetApi();
  const [geoJson, setGeoJson] = useState<GeoJsonFeatureCollection | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const sisenseVersion = useSisenseVersion();

  // retrieve geoJson from API or cache (LocalStorage)
  useEffect(() => {
    if (!sisenseVersion) {
      return;
    }
    const getGeoJsonData = async () => {
      try {
        const cacheKey = getGeoJsonCacheKey(mapType, sisenseVersion);
        const cachedGeoJson = getGeoJsonFromLocalStorage(cacheKey);
        if (!cachedGeoJson) {
          cleanupLocalStorageFromOutdatedGeoJsonCaches(mapType);
          let getGeoJsonFromServer;
          switch (mapType) {
            case 'world':
              getGeoJsonFromServer = api.getCountriesGeoJson;
              break;
            case 'usa':
              getGeoJsonFromServer = api.getUsaStatesGeoJson;
              break;
            default:
              throw new Error(`Unsupported map type: ${mapType}`);
          }
          const geoJsonFromServer = await getGeoJsonFromServer();
          const fixedGeoJsonFromServer =
            mapType === 'world'
              ? fixFeatureIdsForUnrecognizedStates(geoJsonFromServer)
              : geoJsonFromServer;
          setGeoJsonToLocalStorage(fixedGeoJsonFromServer, cacheKey);
          setGeoJson(fixedGeoJsonFromServer);
        } else {
          setGeoJson(cachedGeoJson);
        }
      } catch (err) {
        setError(err as Error);
      }
    };
    getGeoJsonData();
  }, [api, mapType, sisenseVersion]);

  return { geoJson, error };
};

/** Function to get data from LocalStorage */
function getGeoJsonFromLocalStorage(cacheKey: string): GeoJsonFeatureCollection | undefined {
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData) as GeoJsonFeatureCollection;
  }
  return undefined;
}

/** Function to set data to LocalStorage */
const setGeoJsonToLocalStorage = (data: GeoJsonFeatureCollection, cacheKey: string): void => {
  localStorage.setItem(cacheKey, JSON.stringify(data));
};

/**
 * Fixes feature ids for unrecognized states in geoJson.
 * Some unrecognized states (like Somaliland or Northern Cyprus) have the same id = '-99'
 * in geoJson, but they should have some unique ids.
 */
function fixFeatureIdsForUnrecognizedStates(
  geoJson: GeoJsonFeatureCollection,
): GeoJsonFeatureCollection {
  const fixedGeoJson = cloneDeep(geoJson);

  fixedGeoJson.features.forEach((feature) => {
    if (feature.id === '-99') {
      feature.id = feature.properties!.name as string;
    }
  });

  return fixedGeoJson;
}

/** Function to get Sisense version from SisenseContext */
function useSisenseVersion(): string | undefined {
  const { app } = useSisenseContext();
  return app?.settings.serverVersion;
}

// Function to build cache key for geoJson (depends mapType and Sisense version )
function getGeoJsonCacheKey(mapType: AreamapType, sisenseVersion: string): string {
  return `geoJson_${mapType}_${sisenseVersion}`;
}

/** If Sisense version was changed, we need to cleanup LocalStorage from outdated geoJson caches */
function cleanupLocalStorageFromOutdatedGeoJsonCaches(mapType: AreamapType): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(`geoJson_${mapType}`)) {
      localStorage.removeItem(key);
    }
  });
}
