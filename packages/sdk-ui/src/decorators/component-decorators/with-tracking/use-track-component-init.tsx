import { TrackingDetails, trackProductEvent } from '@sisense/sdk-tracking';
import { useSisenseContext } from '../../../sisense-context/sisense-context';
import { createContext, ReactNode, useContext, useEffect, useRef } from 'react';

const action = 'sdkComponentInit';
interface ComponentInitEventDetails extends TrackingDetails {
  packageName: string;
  packageVersion: string;
  componentName: string;
  attributesUsed: string;
}

const TrackingContext = createContext(false);
export const TrackingContextProvider = ({ children }: { children: ReactNode }) => (
  <TrackingContext.Provider value={true}>{children}</TrackingContext.Provider>
);

export const useTrackComponentInit = <P extends {}>(componentName: string, props: P) => {
  const { app, tracking } = useSisenseContext();

  const inTrackingContext = useContext(TrackingContext);

  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (app?.httpClient && !hasTrackedRef.current && !inTrackingContext) {
      const payload: ComponentInitEventDetails = {
        packageName: tracking.packageName,
        packageVersion: __PACKAGE_VERSION__,
        componentName,
        attributesUsed: Object.entries(props)
          .filter(([, v]) => !!v)
          .map(([k]) => k)
          .join(', '),
      };

      void trackProductEvent(action, payload, app.httpClient, !tracking.enabled)
        .catch((e) => console.warn('An error occurred when sending the sdkComponentInit event', e))
        .finally(() => (hasTrackedRef.current = true));
    }
  }, [componentName, props, app, tracking, inTrackingContext]);
};
