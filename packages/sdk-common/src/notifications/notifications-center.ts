import {
  asNotification,
  initialNotificationsState,
  type NotificationsState,
  withHostClaim,
  withNotification,
  withoutAllNotifications,
  withoutHostClaim,
  withoutNotification,
} from './notifications-state.js';
import type {
  NotificationInput,
  NotificationsCenter,
  NotificationsCenterOptions,
} from './types.js';

const DEFAULT_MAX_ITEMS = 5;

const createSequentialIdGenerator = (): (() => string) => {
  let counter = 0;
  return () => `notification-${++counter}`;
};

/**
 * Normalizes the configured cap: non-finite values fall back to the default, fractions are floored, and the minimum is 1.
 * @param maxItems - Configured cap, possibly invalid
 * @returns A positive integer cap.
 */
const asMaxItems = (maxItems: number | undefined): number =>
  maxItems === undefined || !Number.isFinite(maxItems)
    ? DEFAULT_MAX_ITEMS
    : Math.max(1, Math.floor(maxItems));

/**
 * Creates a framework-agnostic notifications center.
 *
 * State lives in a closure and is only replaced through the pure reducers in
 * `notifications-state.ts`; listeners run once per actual state change.
 * @param options - Cap, clock and id source
 * @returns A new {@link NotificationsCenter}.
 * @internal
 */
export function createNotificationsCenter(
  options: NotificationsCenterOptions = {},
): NotificationsCenter {
  const { now = Date.now, generateId = createSequentialIdGenerator() } = options;
  const maxItems = asMaxItems(options.maxItems);

  let state: NotificationsState = initialNotificationsState;
  const listeners = new Set<() => void>();

  const setState = (next: NotificationsState): void => {
    if (next === state) return;
    state = next;
    // Snapshot before dispatch: a listener added during this pass (directly, or by
    // unsubscribing and immediately resubscribing) must not run for the current change,
    // and a listener that resubscribes itself cannot re-enter and loop.
    [...listeners].forEach((listener) => listener());
  };

  return {
    notify(input: NotificationInput): string {
      const dedupeKey = input.dedupeKey ?? input.code;
      const existing = state.items.find((item) => item.dedupeKey === dedupeKey);
      if (existing) return existing.id;

      const notification = asNotification(input, generateId(), now());
      setState(withNotification(state, notification, maxItems));
      return notification.id;
    },
    dismiss(id: string): void {
      setState(withoutNotification(state, id));
    },
    dismissAll(): void {
      setState(withoutAllNotifications(state));
    },
    getSnapshot() {
      return state.items;
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    claimHost(owner: symbol, priority: number): boolean {
      setState(withHostClaim(state, owner, priority));
      return state.hostOwner?.owner === owner;
    },
    releaseHost(owner: symbol): void {
      setState(withoutHostClaim(state, owner));
    },
    getHostOwner(): symbol | null {
      return state.hostOwner?.owner ?? null;
    },
  };
}
