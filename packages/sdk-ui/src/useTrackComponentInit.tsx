import { TrackingDetails, trackProductEvent } from '@sisense/sdk-common';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useSisenseContext } from './components/SisenseContextProvider';

const action = 'sdkComponentInit';
interface ComponentInitEventDetails extends TrackingDetails {
  packageName: 'sdk-ui';
  packageVersion: string;
  componentName: string;
  attributesUsed: string;
}

const TrackingContext = createContext(false);
export const TrackingContextProvider = ({ children }: { children: ReactNode }) => (
  <TrackingContext.Provider value={true}>{children}</TrackingContext.Provider>
);

export const useTrackComponentInit = <P extends {}>(
  componentName: string,
  props: P,
  skip = false,
) => {
  const { app, enableTracking } = useSisenseContext();

  const inTrackingContext = useContext(TrackingContext);

  const [tracked, setTracked] = useState<boolean>();

  useEffect(() => {
    if (app?.httpClient && !tracked && !inTrackingContext && !skip) {
      const payload: ComponentInitEventDetails = {
        packageName: 'sdk-ui',
        packageVersion: __PACKAGE_VERSION__,
        componentName,
        attributesUsed: Object.entries(props)
          .filter(([, v]) => !!v)
          .map(([k]) => k)
          .join(', '),
      };

      void trackProductEvent(action, payload, app.httpClient, !enableTracking)
        .catch((e) => console.log('An error occurred when sending the sdkComponentInit event', e))
        .finally(() => setTracked(true));
    }
  }, [componentName, props, app, enableTracking, tracked, inTrackingContext, skip]);
};
