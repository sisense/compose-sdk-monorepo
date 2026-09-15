import { describe, expect, it } from 'vitest';

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
import type { NotificationInput } from './types.js';

const errorInput: NotificationInput = {
  severity: 'error',
  category: 'auth',
  code: 'auth.sessionExpired',
  message: 'Session expired',
};

const infoInput: NotificationInput = {
  severity: 'info',
  category: 'general',
  code: 'general.saved',
  message: 'Saved',
};

describe('asNotification', () => {
  it('applies defaults: dismissible, dedupeKey = code, autoHideMs = 8000 for error', () => {
    const notification = asNotification(errorInput, 'n-1', 1000);
    expect(notification).toEqual({
      ...errorInput,
      id: 'n-1',
      createdAt: 1000,
      dismissible: true,
      dedupeKey: 'auth.sessionExpired',
      autoHideMs: 8000,
    });
  });

  it('defaults autoHideMs to 5000 for info and success', () => {
    expect(asNotification(infoInput, 'n-1', 0).autoHideMs).toBe(5000);
    expect(asNotification({ ...infoInput, severity: 'success' }, 'n-1', 0).autoHideMs).toBe(5000);
  });

  it('defaults autoHideMs to 6000 for warning', () => {
    expect(asNotification({ ...infoInput, severity: 'warning' }, 'n-1', 0).autoHideMs).toBe(6000);
  });

  it('defaults autoHideMs to undefined (sticky) when an action is attached', () => {
    const action = { label: 'Retry', onClick: () => {} };
    expect(asNotification({ ...errorInput, action }, 'n-1', 0).autoHideMs).toBeUndefined();
  });

  it('keeps explicit dismissible, dedupeKey and autoHideMs', () => {
    const notification = asNotification(
      { ...errorInput, dismissible: false, dedupeKey: 'custom', autoHideMs: 42 },
      'n-1',
      0,
    );
    expect(notification.dismissible).toBe(false);
    expect(notification.dedupeKey).toBe('custom');
    expect(notification.autoHideMs).toBe(42);
  });

  it('keeps an explicit autoHideMs even when an action is attached', () => {
    const action = { label: 'Retry', onClick: () => {} };
    const notification = asNotification({ ...errorInput, action, autoHideMs: 42 }, 'n-1', 0);
    expect(notification.autoHideMs).toBe(42);
  });

  it('stores a plain-string message as-is', () => {
    const notification = asNotification(errorInput, 'n-1', 0);
    expect(notification.message).toBe('Session expired');
  });

  it('copies the message object reference for non-string messages', () => {
    const messageInput = { key: 'msg.key', params: { count: 5 } };
    const input: NotificationInput = {
      ...errorInput,
      message: messageInput,
    };
    const notification = asNotification(input, 'n-1', 0);
    expect(notification.message).not.toBe(messageInput);
    expect(notification.message).toEqual(messageInput);
  });

  it('prevents mutations of the input params from affecting the stored notification', () => {
    const params = { count: 5 };
    const messageInput = { key: 'msg.key', params };
    const input: NotificationInput = {
      ...errorInput,
      message: messageInput,
    };
    const notification = asNotification(input, 'n-1', 0);
    params.count = 10;
    expect((notification.message as typeof messageInput).params?.count).toBe(5);
  });

  it('copies the action object and omits it when absent', () => {
    const action = { label: 'Retry', onClick: () => {} };
    const withAction = asNotification({ ...errorInput, action }, 'n-1', 0);
    expect(withAction.action).not.toBe(action);
    expect(withAction.action).toEqual(action);

    const withoutAction = asNotification(errorInput, 'n-1', 0);
    expect(withoutAction.action).toBeUndefined();
  });

  it('omits title key when absent in input', () => {
    const notification = asNotification(errorInput, 'n-1', 0);
    expect('title' in notification).toBe(false);
  });

  it('copies the title object when present', () => {
    const titleInput = { key: 'title.key', params: { name: 'Test' } };
    const input: NotificationInput = {
      ...errorInput,
      title: titleInput,
    };
    const notification = asNotification(input, 'n-1', 0);
    expect(notification.title).not.toBe(titleInput);
    expect(notification.title).toEqual(titleInput);
  });
});

describe('withNotification', () => {
  const first = asNotification(errorInput, 'n-1', 1);

  it('appends a notification without mutating the previous state', () => {
    const next = withNotification(initialNotificationsState, first, 5);
    expect(next.items).toEqual([first]);
    expect(initialNotificationsState.items).toEqual([]);
  });

  it('returns the same state when a live notification shares the dedupeKey', () => {
    const state = withNotification(initialNotificationsState, first, 5);
    const duplicate = asNotification(errorInput, 'n-2', 2);
    expect(withNotification(state, duplicate, 5)).toBe(state);
  });

  it('evicts the oldest notification beyond maxItems', () => {
    const a = asNotification({ ...infoInput, code: 'a' }, 'a', 1);
    const b = asNotification({ ...infoInput, code: 'b' }, 'b', 2);
    const c = asNotification({ ...infoInput, code: 'c' }, 'c', 3);
    const state = [a, b, c].reduce(
      (acc, item) => withNotification(acc, item, 2),
      initialNotificationsState,
    );
    expect(state.items.map((item) => item.id)).toEqual(['b', 'c']);
  });
});

describe('withoutNotification / withoutAllNotifications', () => {
  const a = asNotification({ ...infoInput, code: 'a' }, 'a', 1);
  const b = asNotification({ ...infoInput, code: 'b' }, 'b', 2);
  const state: NotificationsState = { items: [a, b], hostOwner: null };

  it('removes by id', () => {
    expect(withoutNotification(state, 'a').items).toEqual([b]);
  });

  it('returns the same state for an unknown id', () => {
    expect(withoutNotification(state, 'zzz')).toBe(state);
  });

  it('clears all items, and is a no-op on an empty state', () => {
    expect(withoutAllNotifications(state).items).toEqual([]);
    expect(withoutAllNotifications(initialNotificationsState)).toBe(initialNotificationsState);
  });
});

describe('withHostClaim / withoutHostClaim', () => {
  const viewport = Symbol('viewport');
  const outlet = Symbol('outlet');

  it('grants the claim on an unclaimed state', () => {
    const state = withHostClaim(initialNotificationsState, viewport, 0);
    expect(state.hostOwner).toEqual({ owner: viewport, priority: 0 });
  });

  it('lets a higher priority take over', () => {
    const state = withHostClaim(withHostClaim(initialNotificationsState, viewport, 0), outlet, 2);
    expect(state.hostOwner?.owner).toBe(outlet);
  });

  it('keeps the current owner on equal or lower priority', () => {
    const claimed = withHostClaim(initialNotificationsState, outlet, 2);
    expect(withHostClaim(claimed, viewport, 2)).toBe(claimed);
    expect(withHostClaim(claimed, viewport, 0)).toBe(claimed);
  });

  it('returns the same state when the owner re-claims with the same priority', () => {
    const claimed = withHostClaim(initialNotificationsState, outlet, 2);
    expect(withHostClaim(claimed, outlet, 2)).toBe(claimed);
  });

  it('releases only the current owner', () => {
    const claimed = withHostClaim(initialNotificationsState, outlet, 2);
    expect(withoutHostClaim(claimed, viewport)).toBe(claimed);
    expect(withoutHostClaim(claimed, outlet).hostOwner).toBeNull();
  });
});
