import { createContext, ReactNode, useContext, useEffect, useRef } from 'react';

import { TrackingEventDetails } from '@sisense/sdk-tracking';

import { useTracking } from '@/shared/hooks/use-tracking';

import { useSisenseContext } from '../../../../infra/contexts/sisense-context/sisense-context';
import { TrackingDecoratorConfig } from './with-tracking';

const action = 'sdkComponentInit';
interface ComponentInitEventDetails extends TrackingEventDetails {
  packageName: string;
  packageVersion: string;
  componentName: string;
  attributesUsed: string;
}

type TrackingComponentConfig = TrackingDecoratorConfig;

const TrackingContext = createContext(false);
export const TrackingContextProvider = ({
  skipNested = true,
  children,
}: {
  children: ReactNode;
  skipNested?: boolean;
}) => <TrackingContext.Provider value={skipNested}>{children}</TrackingContext.Provider>;

export const useTrackComponentInit = <P extends {}>(
  trackingComponentConfig: TrackingComponentConfig,
  props: P,
) => {
  const { componentName, config: componentLevelConfig } = trackingComponentConfig;
  const { tracking: contextLevelTracking, app } = useSisenseContext();
  const { trackEvent } = useTracking();

  const inTrackingContext = useContext(TrackingContext);

  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!contextLevelTracking || !app) return;
    const hasBeenTracked = hasTrackedRef.current;
    if (!hasBeenTracked && !inTrackingContext) {
      const payload: ComponentInitEventDetails = {
        packageName: componentLevelConfig.packageName || contextLevelTracking.packageName,
        packageVersion: componentLevelConfig.packageVersion || __PACKAGE_VERSION__,
        componentName,
        attributesUsed: Object.entries(props)
          .filter(([, v]) => !!v)
          .map(([k]) => k)
          .join(', '),
      };

      void trackEvent(action, payload, !contextLevelTracking.enabled).finally(
        () => (hasTrackedRef.current = true),
      );
    }
  }, [
    componentName,
    props,
    contextLevelTracking,
    inTrackingContext,
    trackEvent,
    app,
    componentLevelConfig,
  ]);
};
