import type { NotificationAction, NotificationCategory } from '@sisense/sdk-common';

/**
 * Configures the notifications service.
 *
 * Controls which SDK-produced notifications (for example, expired sessions or
 * insufficient permissions) are raised, and which actions are attached to them.
 * @example
 * Enable network-error notifications and attach a "Log in again" action to auth notifications:
 * ```tsx
 * <SisenseContextProvider
 *   appConfig={{
 *     notificationsConfig: {
 *       categories: { network: true },
 *       actions: { auth: { label: 'Log in again', onClick: () => {} } },
 *     },
 *   }}
 * >
 *   <App />
 * </SisenseContextProvider>
 * ```
 * @group Contexts
 * @alpha
 */
export interface NotificationsConfig {
  /**
   * Which categories of SDK-produced notifications are raised.
   *
   * If not specified, `auth` and `permission` are enabled and the rest are disabled.
   */
  readonly categories?: Readonly<Partial<Record<NotificationCategory, boolean>>>;
  /**
   * Actions attached to SDK-produced notifications.
   */
  readonly actions?: {
    /** Action attached to authentication notifications, for example a "Log in again" button. */
    readonly auth?: NotificationAction;
  };
}

/**
 * Defines the default per-category policy for SDK-produced notifications.
 * @internal
 */
export const DEFAULT_NOTIFICATION_CATEGORIES: Readonly<Record<NotificationCategory, boolean>> = {
  auth: true,
  permission: true,
  network: false,
  server: false,
  general: false,
};
