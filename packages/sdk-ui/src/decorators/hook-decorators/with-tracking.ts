import { TrackingDetails, trackProductEvent } from '@sisense/sdk-tracking';
import { useEffect, useRef } from 'react';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import { ClientApplication } from '../../app/client-application';

export type HookDecorator<DecoratorConfig> = (
  decoratorConfig: DecoratorConfig,
) => <HookArgs extends any[], HookResult>(
  hook: (...args: HookArgs) => HookResult,
) => (...args: HookArgs) => HookResult;

interface HookEventDetails extends TrackingDetails {
  hookName: string;
}

const action = 'sdkHookInit';

/**
 * @internal
 * @description This is a function that tracks the hook event and sends it to the server.
 * @param hookName - The name of the hook
 * @param packageName - The name of the package
 * @param app - The client application
 * @param onFinally - The function to call after the tracking is done
 * @returns Promise<void>
 */
export const trackHook = async (
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

  void trackProductEvent(action, payload, app.httpClient)
    .catch((e) => console.warn('An error occurred when sending the sdkHookInit event', e))
    .finally(onFinally);
};

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
