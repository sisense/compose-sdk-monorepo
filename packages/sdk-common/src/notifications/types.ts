/**
 * Ranks a notification's severity, which drives styling and default auto-hide behavior.
 * @alpha
 */
export type NotificationSeverity = 'error' | 'warning' | 'info' | 'success';

/**
 * Classifies a notification so SDK-produced notifications can be filtered by category.
 * @alpha
 */
export type NotificationCategory = 'auth' | 'permission' | 'network' | 'server' | 'general';

/**
 * Represents notification text as a plain string or a translation reference resolved by the renderer.
 * @alpha
 */
export type NotificationText =
  | string
  | {
      /** Translation key, e.g. `notifications.auth.sessionExpiredTitle`. */
      readonly key: string;
      /** i18next namespace. Defaults to the renderer's namespace when omitted. */
      readonly namespace?: string;
      /** Interpolation parameters. */
      readonly params?: Readonly<Record<string, unknown>>;
    };

/**
 * Describes an action button attached to a notification.
 * @alpha
 */
export interface NotificationAction {
  /** Button label. */
  readonly label: NotificationText;
  /** Invoked when the button is clicked. */
  readonly onClick: () => void;
}

/**
 * Represents a user-facing notification held by a {@link NotificationsCenter}.
 * @alpha
 */
export interface Notification {
  /** Unique id within the center. */
  readonly id: string;
  readonly severity: NotificationSeverity;
  readonly category: NotificationCategory;
  /** Stable machine code in the form `<category>.<name>`, e.g. `auth.sessionExpired`. */
  readonly code: string;
  readonly title?: NotificationText;
  readonly message: NotificationText;
  /** Whether the user can dismiss the notification. Defaults to `true`. */
  readonly dismissible: boolean;
  /**
   * Milliseconds until automatic dismissal by a renderer. Defaults to 5000 for info and success,
   * 6000 for warning, 8000 for error, and `undefined` (sticky) when an action is attached.
   * `undefined` means sticky.
   */
  readonly autoHideMs?: number;
  /** Live notifications sharing this key collapse into one. Defaults to `code`. */
  readonly dedupeKey: string;
  readonly action?: NotificationAction;
  /** Original error or payload, for host inspection. */
  readonly cause?: unknown;
  /** Creation timestamp in milliseconds since epoch. */
  readonly createdAt: number;
}

/**
 * Describes the input accepted by {@link NotificationsCenter.notify}; fields with defaults are optional.
 * @alpha
 */
export type NotificationInput = Omit<
  Notification,
  'id' | 'createdAt' | 'dismissible' | 'dedupeKey'
> & {
  readonly dismissible?: boolean;
  readonly dedupeKey?: string;
};

/**
 * Stores notifications and lets subscribers observe changes, independent of any UI framework.
 * @alpha
 */
export interface NotificationsCenter {
  /** Adds a notification and returns its id. Returns the existing id when deduped. */
  notify(input: NotificationInput): string;
  /** Removes the notification with the given id. No-op when absent. */
  dismiss(id: string): void;
  /** Removes all notifications. */
  dismissAll(): void;
  /** Returns the current notifications. Same reference until the state changes. */
  getSnapshot(): readonly Notification[];
  /** Registers a change listener and returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
  /**
   * Claims the right to render this center's notifications. A higher priority wins;
   * on equal priority the current owner keeps it. Returns whether `owner` now renders.
   */
  claimHost(owner: symbol, priority: number): boolean;
  /** Releases a host claim. No-op when `owner` is not the current host. */
  releaseHost(owner: symbol): void;
  /** Returns the current host owner, or `null`. */
  getHostOwner(): symbol | null;
}

/**
 * Configures `createNotificationsCenter`.
 * @internal
 */
export interface NotificationsCenterOptions {
  /**
   * Maximum simultaneously held notifications; oldest are evicted first. Non-integer values
   * are floored, values below 1 are treated as 1, and non-finite values fall back to the default. Defaults to 5.
   */
  maxItems?: number;
  /** Clock, injectable for tests. Defaults to `Date.now`. */
  now?: () => number;
  /**
   * Id source, injectable for tests. Defaults to a per-center sequential generator.
   * Must return a value that is unique within the center for every call.
   */
  generateId?: () => string;
}
