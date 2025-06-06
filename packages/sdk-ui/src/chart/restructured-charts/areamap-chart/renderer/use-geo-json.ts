import { FeatureCollection as GeoJsonFeatureCollection } from 'geojson';
import cloneDeep from 'lodash-es/cloneDeep';
import { useSisenseContext } from '@/sisense-context/sisense-context.js';
import { useEffect, useState } from 'react';
import { useRestApi } from '@/api/rest-api.js';
import { AreamapType } from '@/types.js';
import { TranslatableError } from '@/translation/translatable-error';

/**
 * Hook to get geoJson from API or cache (LocalStorage)
 */
export const useGeoJson = (
  mapType: AreamapType,
): { geoJson: GeoJsonFeatureCollection | undefined; error: Error | undefined } => {
  const { isReady: apiIsReady, restApi: api } = useRestApi();
  const [geoJson, setGeoJson] = useState<GeoJsonFeatureCollection | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const sisenseVersion = useSisenseVersion();

  // retrieve geoJson from API or cache (LocalStorage)
  useEffect(() => {
    if (!sisenseVersion || !apiIsReady || !api) {
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
              throw new TranslatableError('errors.unsupportedMapType', { mapType });
          }
          const geoJsonFromServer = await getGeoJsonFromServer();
          if (!geoJsonFromServer) {
            throw new TranslatableError('errors.mapLoadingFailed');
          }
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
  }, [api, apiIsReady, mapType, sisenseVersion]);

  return { geoJson, error };
};

/** Function to get data from LocalStorage */
function getGeoJsonFromLocalStorage(cacheKey: string) {
  const cachedData = localStorage.getItem(cacheKey);
  if (!cachedData) {
    return;
  }
  return JSON.parse(cachedData) as GeoJsonFeatureCollection;
}

/** Function to set data to LocalStorage */
function setGeoJsonToLocalStorage(data: GeoJsonFeatureCollection, cacheKey: string) {
  localStorage.setItem(cacheKey, JSON.stringify(data));
}

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
      feature.id = feature.properties?.name;
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
