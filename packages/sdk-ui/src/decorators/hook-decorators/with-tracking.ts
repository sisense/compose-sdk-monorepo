import { useEffect, useRef } from 'react';

import { TrackingEventDetails, trackProductEvent } from '@sisense/sdk-tracking';

import { useTracking } from '@/common/hooks/use-tracking';

import { ClientApplication } from '../../app/client-application';
import { useSisenseContext } from '../../sisense-context/sisense-context';

export type HookDecorator<DecoratorConfig> = (
  decoratorConfig: DecoratorConfig,
) => <HookArgs extends any[], HookResult>(
  hook: (...args: HookArgs) => HookResult,
) => (...args: HookArgs) => HookResult;

interface HookEventDetails extends TrackingEventDetails {
  hookName: string;
}

const action = 'sdkHookInit';

/**
 * Tracks the hook event and sends it to the server.
 *
 * @param hookName - The name of the hook
 * @param packageName - The name of the package
 * @param app - The client application
 * @param onFinally - The function to call after the tracking is done
 * @internal
 */
export const trackHook = (
  hookName: string,
  packageName: string,
  app: ClientApplication,
  onFinally: () => void,
) => {
  if (!app) return;
  const payload: HookEventDetails = {
    packageName,
    packageVersion: __PACKAGE_VERSION__,
    hookName,
  };

  void trackProductEvent(action, payload, app.httpClient).finally(onFinally);
};

function useTrackHook(hookName: string) {
  const { tracking, app } = useSisenseContext();
  const { trackEvent } = useTracking();

  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!tracking || !app) return;
    if (!hasTrackedRef.current) {
      const payload: HookEventDetails = {
        packageName: tracking.packageName || 'sdk-ui',
        packageVersion: __PACKAGE_VERSION__,
        hookName,
      };
      void trackEvent(action, payload, !tracking.enabled).finally(
        () => (hasTrackedRef.current = true),
      );
    }
  }, [tracking, hookName, trackEvent, app]);
}

export const withTracking: HookDecorator<string> =
  (hookName) =>
  (hook) =>
  (...args) => {
    useTrackHook(hookName);
    return hook(...args);
  };
