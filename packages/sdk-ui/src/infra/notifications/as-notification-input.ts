import type { NotificationCategory, NotificationInput } from '@sisense/sdk-common';
import type { HttpErrorEvent } from '@sisense/sdk-rest-client';

import { DEFAULT_NOTIFICATION_CATEGORIES, type NotificationsConfig } from './types.js';

/**
 * Describes the fixed notification content (code, category and translation keys) produced
 * for one kind of HTTP failure.
 */
type NotificationSpec = {
  readonly code: string;
  readonly category: NotificationCategory;
  readonly titleKey: string;
  readonly messageKey: string;
};

/** Spec for a 401 from a session-based authenticator (SSO or Fusion). */
const SESSION_EXPIRED: NotificationSpec = {
  code: 'auth.sessionExpired',
  category: 'auth',
  titleKey: 'notifications.auth.sessionExpiredTitle',
  messageKey: 'notifications.auth.sessionExpiredMessage',
};

/** Spec for a 401 from a credential-based authenticator (password, bearer token or WAT). */
const AUTHENTICATION_FAILED: NotificationSpec = {
  code: 'auth.authenticationFailed',
  category: 'auth',
  titleKey: 'notifications.auth.authenticationFailedTitle',
  messageKey: 'notifications.auth.authenticationFailedMessage',
};

/** Maps every non-401 {@link HttpErrorEvent} kind to its notification spec. */
const SPECS_BY_KIND: Record<Exclude<HttpErrorEvent['kind'], 'unauthorized'>, NotificationSpec> = {
  forbidden: {
    code: 'permission.forbidden',
    category: 'permission',
    titleKey: 'notifications.permission.forbiddenTitle',
    messageKey: 'notifications.permission.forbiddenMessage',
  },
  network: {
    code: 'network.unreachable',
    category: 'network',
    titleKey: 'notifications.network.unreachableTitle',
    messageKey: 'notifications.network.unreachableMessage',
  },
  server: {
    code: 'server.error',
    category: 'server',
    titleKey: 'notifications.server.errorTitle',
    messageKey: 'notifications.server.errorMessage',
  },
  client: {
    code: 'general.requestFailed',
    category: 'general',
    titleKey: 'notifications.general.requestFailedTitle',
    messageKey: 'notifications.general.requestFailedMessage',
  },
};

/**
 * Determines whether an authenticator type keeps the user signed in through a server-side
 * session that can expire independently of any credential the SDK holds.
 * @param authType - Authenticator type from a {@link HttpErrorEvent}
 * @returns `true` for SSO and Fusion authenticators, `false` otherwise.
 */
const isSessionBasedAuth = (authType: HttpErrorEvent['authType']): boolean =>
  authType === 'sso' || authType === 'fusion';

/**
 * Picks the notification spec matching a classified HTTP failure.
 * @param event - Classified HTTP failure emitted by `HttpClient`
 * @returns The {@link NotificationSpec} to build the notification from.
 */
const asNotificationSpec = (event: HttpErrorEvent): NotificationSpec =>
  event.kind === 'unauthorized'
    ? isSessionBasedAuth(event.authType)
      ? SESSION_EXPIRED
      : AUTHENTICATION_FAILED
    : SPECS_BY_KIND[event.kind];

/**
 * Determines whether notifications of a category are raised, honoring the caller's
 * configuration and falling back to the SDK default per category.
 * @param category - Notification category to check
 * @param config - Notifications configuration supplying the category overrides
 * @returns Whether notifications of `category` should be raised.
 */
const isCategoryEnabled = (category: NotificationCategory, config: NotificationsConfig): boolean =>
  config.categories?.[category] ?? DEFAULT_NOTIFICATION_CATEGORIES[category];

/**
 * Converts a failed HTTP request into a notification input, or `undefined` when the
 * notification's category is disabled by the configuration.
 *
 * Pure: the same event and config always yield the same result.
 * @param event - Classified HTTP failure emitted by `HttpClient`
 * @param config - Notifications configuration (categories and actions)
 * @returns Notification input for the center, or `undefined` to stay silent.
 * @internal
 */
export function asNotificationInput(
  event: HttpErrorEvent,
  config: NotificationsConfig = {},
): NotificationInput | undefined {
  const spec = asNotificationSpec(event);
  if (!isCategoryEnabled(spec.category, config)) {
    return undefined;
  }

  const action = spec.category === 'auth' ? config.actions?.auth : undefined;

  return {
    code: spec.code,
    category: spec.category,
    severity: 'error',
    title: { key: spec.titleKey },
    message: { key: spec.messageKey },
    cause: event.error,
    ...(action ? { action } : {}),
  };
}
