import { trackHook } from '@sisense/sdk-ui-preact';
import { getApp } from '../providers/sisense-context-provider.js';
import { ref, watchEffect } from 'vue';

/**
 * @internal
 * A Vue composable function `useTracking` designed to track the usage of hooks within Vue applications
 * using the Sisense SDK. It sends tracking information to the server whenever a specified hook is used,
 * helping in the analysis and optimization of application performance and usage patterns. This composable
 * is intended for internal use and aids in monitoring the integration and efficiency of Sisense SDK hooks.
 *
 * @param {string} hookName - The name of the hook being tracked. This identifier is used to log the hook
 * event uniquely, facilitating the collection of usage data for specific hooks within the application.
 *
 * @example
 * How to use `useTracking` to track the usage of a custom hook:
 * ```javascript
 * import { useTracking } from './composables/useTracking';
 *
 * // Example hook that utilizes useTracking for monitoring its usage
 * export const useCustomHook = () => {
 *   const { hasTrackedRef } = useTracking('useCustomHook');
 *
 *   // Hook implementation...
 *
 *   return {
 *     // Return values of your custom hook
 *   };
 * };
 * ```
 *
 * The composable returns an object containing:
 * - `hasTrackedRef`: A Vue ref that indicates whether the tracking for the hook has been successfully
 *   sent to the server. It starts as `false` and is set to `true` once tracking is completed, preventing
 *   duplicate tracking events.
 *
 * This internal utility composable is essential for maintaining insights into the usage of custom hooks
 * within applications leveraging the Sisense SDK, enabling developers and analysts to understand and optimize
 * hook interactions and performance.
 */
export const useTracking = (hookName: string) => {
  const hasTrackedRef = ref(false);
  const contextApp = getApp();

  const track = () => {
    if (!contextApp.value || hasTrackedRef.value) return null;
    const app = contextApp.value;
    try {
      trackHook(hookName, 'sdk-ui-vue', app, () => (hasTrackedRef.value = true));
    } catch (error) {
      console.error('An error occurred when calling the traceHook', error);
    }
  };

  watchEffect(() => {
    track();
  });

  return { hasTrackedRef };
};
