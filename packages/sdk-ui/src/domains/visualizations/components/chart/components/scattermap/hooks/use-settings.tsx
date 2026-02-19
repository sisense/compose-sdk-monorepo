import { useCallback, useEffect, useState } from 'react';

import { useSisenseContext } from '../../../../../../../infra/contexts/sisense-context/sisense-context.js';

type GeoSettings = {
  maps_api_provider: string;
};

// todo: when those setting would be available globally, take this data from there
export const useGeoSettings = () => {
  const { app } = useSisenseContext();
  const [geoSettings, setGeoSettings] = useState<GeoSettings | null>(null);

  const getSettings = useCallback(async () => {
    if (!app) return;
    const settingsResponse = await app.httpClient.get<{ geo: GeoSettings }>(
      'api/v1/settings/system',
    );
    if (!settingsResponse) return;

    setGeoSettings(settingsResponse.geo);
  }, [setGeoSettings, app]);

  useEffect(() => {
    getSettings();
  }, [app, getSettings]);

  return geoSettings;
};
