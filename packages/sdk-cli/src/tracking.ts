import { HttpClient } from '@sisense/sdk-rest-client';
import { TrackingEventDetails, trackProductEvent } from '@sisense/sdk-tracking';

import { PKG_VERSION } from './package-version.js';

interface ExecutionEventDetails extends TrackingEventDetails {
  packageVersion: string;
  commandName: string;
  argumentsPassed: string;
}

export const trackExecution = <T extends {}>(
  httpClient: HttpClient,
  commandName: string,
  args: T,
) => {
  const payload: ExecutionEventDetails = {
    packageVersion: PKG_VERSION,
    commandName,
    argumentsPassed: Object.entries(args)
      .filter(([, v]) => !!v)
      .map(([k]) => k)
      .join(', '),
  };

  trackProductEvent('sdkCliExec', payload, httpClient);
};
