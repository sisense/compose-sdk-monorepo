import { TrackingDetails, trackProductEvent } from '@sisense/sdk-tracking';
import { useEffect, useRef } from 'react';
import { useSisenseContext } from '../../sisense-context/sisense-context';

export type HookDecorator<DecoratorConfig> = (
  decoratorConfig: DecoratorConfig,
) => <HookArgs extends any[], HookResult>(
  hook: (...args: HookArgs) => HookResult,
) => (...args: HookArgs) => HookResult;

interface HookEventDetails extends TrackingDetails {
  hookName: string;
}

const action = 'sdkHookInit';

function useTrackHook(hookName: string) {
  const { app, enableTracking } = useSisenseContext();

  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (app?.httpClient && !hasTrackedRef.current) {
      const payload: HookEventDetails = {
        packageName: 'sdk-ui',
        packageVersion: __PACKAGE_VERSION__,
        hookName,
      };
      void trackProductEvent(action, payload, app.httpClient, !enableTracking)
        .catch((e) => console.warn('An error occurred when sending the sdkHookInit event', e))
        .finally(() => (hasTrackedRef.current = true));
    }
  }, [app, enableTracking, hookName]);
}

export const withTracking: HookDecorator<string> =
  (hookName) =>
  (hook) =>
  (...args) => {
    useTrackHook(hookName);
    return hook(...args);
  };
