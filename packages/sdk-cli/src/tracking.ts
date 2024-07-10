import { TrackingDetails, trackProductEvent } from '@sisense/sdk-tracking';
import { HttpClient } from '@sisense/sdk-rest-client';
import { PKG_VERSION } from './package-version.js';
import { TrackingActions } from './constants.js';

interface ExecutionEventDetails extends TrackingDetails {
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

  const action = TrackingActions.Execution;

  trackProductEvent(action, payload, httpClient);
};
