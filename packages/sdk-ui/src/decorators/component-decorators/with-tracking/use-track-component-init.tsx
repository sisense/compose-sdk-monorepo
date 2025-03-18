import { TrackingEventDetails } from '@sisense/sdk-tracking';
import { useSisenseContext } from '../../../sisense-context/sisense-context';
import { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import { useTracking } from '@/common/hooks/use-tracking';

const action = 'sdkComponentInit';
interface ComponentInitEventDetails extends TrackingEventDetails {
  packageName: string;
  packageVersion: string;
  componentName: string;
  attributesUsed: string;
}

const TrackingContext = createContext(false);
export const TrackingContextProvider = ({
  skipNested = true,
  children,
}: {
  children: ReactNode;
  skipNested?: boolean;
}) => <TrackingContext.Provider value={skipNested}>{children}</TrackingContext.Provider>;

export const useTrackComponentInit = <P extends {}>(componentName: string, props: P) => {
  const { tracking, app } = useSisenseContext();
  const { trackEvent } = useTracking();

  const inTrackingContext = useContext(TrackingContext);

  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!tracking || !app) return;
    const hasBeenTracked = hasTrackedRef.current;
    if (!hasBeenTracked && !inTrackingContext) {
      const payload: ComponentInitEventDetails = {
        packageName: tracking.packageName,
        packageVersion: __PACKAGE_VERSION__,
        componentName,
        attributesUsed: Object.entries(props)
          .filter(([, v]) => !!v)
          .map(([k]) => k)
          .join(', '),
      };

      void trackEvent(action, payload, !tracking.enabled).finally(
        () => (hasTrackedRef.current = true),
      );
    }
  }, [componentName, props, tracking, inTrackingContext, trackEvent, app]);
};
