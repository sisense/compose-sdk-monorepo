import type { NotificationText } from '@sisense/sdk-common';
import type { TFunction } from 'i18next';

/**
 * Resolves notification text to a display string: plain strings pass through, translation references
 * are translated with the given `t` (honoring `namespace` and `params`).
 * @param text - Notification text, or `undefined` for optional fields
 * @param t - i18next translate function bound to the sdk-ui namespace
 * @returns The display string, empty when `text` is `undefined`.
 * @internal
 */
export function resolveNotificationText(text: NotificationText | undefined, t: TFunction): string {
  if (text === undefined) return '';
  if (typeof text === 'string') return text;
  return t(text.key, { ...(text.params ?? {}), ...(text.namespace ? { ns: text.namespace } : {}) });
}
