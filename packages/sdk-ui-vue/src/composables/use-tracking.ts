import { trackHook } from '@ethings-os/sdk-ui-preact';
import { getSisenseContext } from '../providers/sisense-context-provider';
import { ref, watchEffect } from 'vue';

/**
 * A Vue composable function `useTracking` designed to track the usage of composables within Vue applications
 * using the Sisense SDK. It sends tracking information to the server whenever a specified composable is used,
 * helping in the analysis and optimization of application performance and usage patterns. This composable
 * is intended for internal use and aids in monitoring the integration and efficiency of Sisense SDK composables.
 *
 * @param {string} composableName - The name of the composable being tracked. This identifier is used to log the composable
 * event uniquely, facilitating the collection of usage data for specific composables within the application.
 *
 * @example
 * How to use `useTracking` to track the usage of a custom composable:
 * ```javascript
 * import { useTracking } from '@ethings-os/sdk-ui-vue';
 *
 * // Example composable that utilizes useTracking for monitoring its usage
 * export const useCustomComposable = () => {
 *   const { hasTrackedRef } = useTracking('useCustomComposable');
 *
 *   // composable implementation...
 *
 *   return {
 *     // Return values of your custom composable
 *   };
 * };
 * ```
 *
 * The composable returns an object containing:
 * - `hasTrackedRef`: A Vue ref that indicates whether the tracking for the composable has been successfully
 *   sent to the server. It starts as `false` and is set to `true` once tracking is completed, preventing
 *   duplicate tracking events.
 *
 * This internal utility composable is essential for maintaining insights into the usage of custom composables
 * within applications leveraging the Sisense SDK, enabling developers and analysts to understand and optimize
 * composable interactions and performance.
 *
 * @internal
 */
export const useTracking = (composableName: string) => {
  const hasTrackedRef = ref(false);
  const contex = getSisenseContext();

  const track = () => {
    const { app } = contex.value;
    if (!app || hasTrackedRef.value) return null;
    try {
      trackHook(composableName, 'sdk-ui-vue', app, () => (hasTrackedRef.value = true));
    } catch (error) {
      console.error('An error occurred when calling the trackHook', error);
    }
  };

  watchEffect(() => {
    track();
  });

  return { hasTrackedRef };
};
