import type { Notification, NotificationInput, NotificationText } from './types.js';

/**
 * Records which renderer currently owns the built-in UI for a center.
 * @internal
 */
export interface HostClaim {
  readonly owner: symbol;
  readonly priority: number;
}

/**
 * Holds the immutable state of a notifications center.
 * @internal
 */
export interface NotificationsState {
  readonly items: readonly Notification[];
  readonly hostOwner: HostClaim | null;
}

/**
 * Provides the empty initial state with no host claim.
 * @internal
 */
export const initialNotificationsState: NotificationsState = { items: [], hostOwner: null };

/**
 * Computes the default auto-hide duration for a notification input that does not set one.
 * Notifications with an action are sticky so the user can click the button; otherwise the
 * duration scales with severity: 8000ms for error, 6000ms for warning, and 5000ms for info
 * and success.
 * @param input - Raw notification input
 * @returns Milliseconds until automatic dismissal, or `undefined` for a sticky notification.
 * @internal
 */
const defaultAutoHideMs = (input: NotificationInput): number | undefined => {
  if (input.action) {
    return undefined;
  }
  switch (input.severity) {
    case 'error':
      return 8000;
    case 'warning':
      return 6000;
    case 'info':
    case 'success':
      return 5000;
  }
};

/**
 * Copies a notification text so later mutations of the caller's object cannot alter the stored notification.
 * @param text - Plain string or translation reference
 * @returns The same string, or a shallow copy of the reference with a copied `params` record.
 * @internal
 */
const asStoredText = (text: NotificationText): NotificationText =>
  typeof text === 'string'
    ? text
    : { ...text, ...(text.params ? { params: { ...text.params } } : {}) };

/**
 * Converts an input into a full notification by applying defaults.
 * @param input - Raw notification input
 * @param id - Id to assign to the notification
 * @param createdAt - Creation timestamp in milliseconds since epoch
 * @returns The notification with defaults applied.
 * @internal
 */
export function asNotification(
  input: NotificationInput,
  id: string,
  createdAt: number,
): Notification {
  return {
    ...input,
    id,
    createdAt,
    dismissible: input.dismissible ?? true,
    dedupeKey: input.dedupeKey ?? input.code,
    autoHideMs: input.autoHideMs ?? defaultAutoHideMs(input),
    message: asStoredText(input.message),
    ...(input.title !== undefined && { title: asStoredText(input.title) }),
    ...(input.action && { action: { ...input.action } }),
  };
}

/**
 * Appends a notification unless a live one shares its dedupe key; evicts the oldest beyond `maxItems`.
 * @param state - Current state
 * @param notification - Notification to append
 * @param maxItems - Maximum number of items to keep
 * @returns The next state, or the same state when deduped.
 * @internal
 */
export function withNotification(
  state: NotificationsState,
  notification: Notification,
  maxItems: number,
): NotificationsState {
  if (state.items.some((item) => item.dedupeKey === notification.dedupeKey)) {
    return state;
  }
  const items = [...state.items, notification];
  return {
    ...state,
    items: items.length > maxItems ? items.slice(items.length - maxItems) : items,
  };
}

/**
 * Removes the notification with the given id.
 * @param state - Current state
 * @param id - Id of the notification to remove
 * @returns The next state, or the same state when the id is absent.
 * @internal
 */
export function withoutNotification(state: NotificationsState, id: string): NotificationsState {
  const items = state.items.filter((item) => item.id !== id);
  return items.length === state.items.length ? state : { ...state, items };
}

/**
 * Removes all notifications.
 * @param state - Current state
 * @returns The next state, or the same state when already empty.
 * @internal
 */
export function withoutAllNotifications(state: NotificationsState): NotificationsState {
  return state.items.length === 0 ? state : { ...state, items: [] };
}

/**
 * Grants the host claim to `owner` when unclaimed or when `priority` beats the current owner's.
 * @param state - Current state
 * @param owner - Owner requesting the claim
 * @param priority - Priority of the claim
 * @returns The next state, or the same state when the claim is not granted.
 * @internal
 */
export function withHostClaim(
  state: NotificationsState,
  owner: symbol,
  priority: number,
): NotificationsState {
  const current = state.hostOwner;
  if (current && current.owner === owner && current.priority === priority) {
    return state;
  }
  if (current && current.owner !== owner && current.priority >= priority) {
    return state;
  }
  return { ...state, hostOwner: { owner, priority } };
}

/**
 * Releases the host claim when `owner` is the current holder.
 * @param state - Current state
 * @param owner - Owner releasing the claim
 * @returns The next state, or the same state when `owner` is not the current host.
 * @internal
 */
export function withoutHostClaim(state: NotificationsState, owner: symbol): NotificationsState {
  return state.hostOwner?.owner === owner ? { ...state, hostOwner: null } : state;
}
