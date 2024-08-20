/**
 * Registry of all tracking events
 *
 * This registry contains tracking events and their configurations.
 * Each configuration specifies whether the event should be sent to the server (`internal`)
 * and whether a custom tracking callback should be invoked (`external`).
 *
 * @internal
 */
export const eventRegistry = {
  sdkComponentInit: { internal: true, external: true },
  sdkHookInit: { internal: true, external: true },
  sdkError: { internal: true, external: false },
  sdkCliExec: { internal: true, external: false },
  sdkAngularServiceMethodExecuted: { internal: true, external: true },
};

/**
 * Type representing each tracking action from the event registry.
 * Ensures new events are registered and configured correctly.
 */
export type TrackingEventType = keyof typeof eventRegistry;
