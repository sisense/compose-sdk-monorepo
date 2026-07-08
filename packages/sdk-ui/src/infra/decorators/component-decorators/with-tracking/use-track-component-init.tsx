import { createContext, ReactNode, useContext, useEffect, useMemo, useRef } from 'react';

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

type TrackingContextValue = {
  skipNested: boolean;
};

const TrackingContext = createContext<TrackingContextValue>({
  skipNested: false,
});
export const TrackingContextProvider = ({
  skipNested = true,
  children,
}: {
  children: ReactNode;
  skipNested?: boolean;
}) => {
  const contextValue = useMemo(() => ({ skipNested: skipNested }), [skipNested]);
  return <TrackingContext.Provider value={contextValue}>{children}</TrackingContext.Provider>;
};

/**
 * Reads whether the current subtree is already inside a tracking context — i.e. an ancestor
 * component is being tracked, so nested components must not fire their own init event.
 */
export const useTrackingContext = () => useContext(TrackingContext);

export const useTrackComponentInit = <P extends {}>(
  trackingComponentConfig: TrackingComponentConfig,
  props: P,
) => {
  const { componentName, config: componentLevelConfig } = trackingComponentConfig;
  const { tracking: contextLevelTracking, app } = useSisenseContext();
  const { trackEvent } = useTracking();

  const { skipNested: parentSkipNested } = useTrackingContext();

  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!contextLevelTracking || !app) return;
    const hasBeenTracked = hasTrackedRef.current;
    if (!hasBeenTracked && !parentSkipNested) {
      // Mark as tracked synchronously, before the async call to avoid duplicate events in case of re-render or StrictMode
      hasTrackedRef.current = true;
      const payload: ComponentInitEventDetails = {
        packageName: componentLevelConfig.packageName || contextLevelTracking.packageName,
        packageVersion: componentLevelConfig.packageVersion || __PACKAGE_VERSION__,
        componentName,
        attributesUsed: Object.entries(props)
          .filter(([, v]) => !!v)
          .map(([k]) => k)
          .join(', '),
      };

      void trackEvent(action, payload, !contextLevelTracking.enabled);
    }
  }, [
    componentName,
    props,
    contextLevelTracking,
    parentSkipNested,
    trackEvent,
    app,
    componentLevelConfig,
  ]);
};
