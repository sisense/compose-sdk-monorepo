import { describe, expect, it, vi } from 'vitest';

import { createNotificationsCenter } from './notifications-center.js';
import type { NotificationInput } from './types.js';

const authError: NotificationInput = {
  severity: 'error',
  category: 'auth',
  code: 'auth.sessionExpired',
  message: { key: 'notifications.auth.sessionExpiredMessage' },
};

const forbidden: NotificationInput = {
  severity: 'error',
  category: 'permission',
  code: 'permission.forbidden',
  message: 'Forbidden',
};

describe('createNotificationsCenter', () => {
  it('starts empty and returns a stable snapshot reference', () => {
    const center = createNotificationsCenter();
    const first = center.getSnapshot();
    expect(first).toEqual([]);
    expect(center.getSnapshot()).toBe(first);
  });

  it('notify adds a notification with generated id and timestamp', () => {
    const center = createNotificationsCenter({ now: () => 1234, generateId: () => 'fixed-id' });
    const id = center.notify(authError);
    expect(id).toBe('fixed-id');
    expect(center.getSnapshot()).toEqual([
      {
        ...authError,
        id: 'fixed-id',
        createdAt: 1234,
        dismissible: true,
        dedupeKey: 'auth.sessionExpired',
        autoHideMs: 8000,
      },
    ]);
  });

  it('generates sequential ids by default', () => {
    const center = createNotificationsCenter();
    expect(center.notify(authError)).toBe('notification-1');
    expect(center.notify(forbidden)).toBe('notification-2');
  });

  it('dedupes on dedupeKey and returns the existing id', () => {
    const center = createNotificationsCenter();
    const firstId = center.notify(authError);
    const secondId = center.notify({ ...authError, message: 'different text, same code' });
    expect(secondId).toBe(firstId);
    expect(center.getSnapshot()).toHaveLength(1);
  });

  it('caps the stack at maxItems, evicting the oldest', () => {
    const center = createNotificationsCenter({ maxItems: 2 });
    center.notify({ ...forbidden, code: 'a' });
    center.notify({ ...forbidden, code: 'b' });
    center.notify({ ...forbidden, code: 'c' });
    expect(center.getSnapshot().map((item) => item.code)).toEqual(['b', 'c']);
  });

  it('treats maxItems: 0 as 1', () => {
    const center = createNotificationsCenter({ maxItems: 0 });
    center.notify({ ...forbidden, code: 'a' });
    center.notify({ ...forbidden, code: 'b' });
    expect(center.getSnapshot().map((item) => item.code)).toEqual(['b']);
  });

  it('floors a fractional maxItems', () => {
    const center = createNotificationsCenter({ maxItems: 1.5 });
    center.notify({ ...forbidden, code: 'a' });
    center.notify({ ...forbidden, code: 'b' });
    expect(center.getSnapshot().map((item) => item.code)).toEqual(['b']);
  });

  it('caps at the default when maxItems is NaN', () => {
    const center = createNotificationsCenter({ maxItems: NaN });
    for (let i = 1; i <= 6; i++) {
      center.notify({ ...forbidden, code: `code${i}` });
    }
    const codes = center.getSnapshot().map((item) => item.code);
    expect(codes).toHaveLength(5);
    expect(codes).toEqual(['code2', 'code3', 'code4', 'code5', 'code6']);
  });

  it('caps at the default when maxItems is Infinity', () => {
    const center = createNotificationsCenter({ maxItems: Infinity });
    for (let i = 1; i <= 6; i++) {
      center.notify({ ...forbidden, code: `code${i}` });
    }
    const codes = center.getSnapshot().map((item) => item.code);
    expect(codes).toHaveLength(5);
    expect(codes).toEqual(['code2', 'code3', 'code4', 'code5', 'code6']);
  });

  it('dismiss removes one, dismissAll removes everything', () => {
    const center = createNotificationsCenter();
    const id = center.notify(authError);
    center.notify(forbidden);
    center.dismiss(id);
    expect(center.getSnapshot().map((item) => item.code)).toEqual(['permission.forbidden']);
    center.dismissAll();
    expect(center.getSnapshot()).toEqual([]);
  });

  it('notifies subscribers on every change and not on no-ops', () => {
    const center = createNotificationsCenter();
    const listener = vi.fn();
    center.subscribe(listener);

    center.notify(authError);
    expect(listener).toHaveBeenCalledTimes(1);

    center.notify(authError); // deduped → no change
    expect(listener).toHaveBeenCalledTimes(1);

    center.dismiss('unknown'); // no change
    expect(listener).toHaveBeenCalledTimes(1);

    center.dismissAll();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('stops notifying after unsubscribe', () => {
    const center = createNotificationsCenter();
    const listener = vi.fn();
    const unsubscribe = center.subscribe(listener);
    unsubscribe();
    center.notify(authError);
    expect(listener).not.toHaveBeenCalled();
  });

  it('does not call a listener subscribed during dispatch until the next change', () => {
    const center = createNotificationsCenter();
    const second = vi.fn();
    const first = vi.fn(() => {
      center.subscribe(second);
    });
    center.subscribe(first);

    center.notify(authError);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    center.notify(forbidden);
    expect(first).toHaveBeenCalledTimes(2);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('calls a listener that unsubscribes and resubscribes itself exactly once per change', () => {
    const center = createNotificationsCenter();
    let unsubscribe: () => void = () => {};
    const listener = vi.fn(() => {
      unsubscribe();
      unsubscribe = center.subscribe(listener);
    });
    unsubscribe = center.subscribe(listener);

    center.notify(authError);
    expect(listener).toHaveBeenCalledTimes(1);

    center.notify(forbidden);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('claimHost follows priority and notifies subscribers on ownership changes', () => {
    const center = createNotificationsCenter();
    const listener = vi.fn();
    center.subscribe(listener);
    const viewport = Symbol('viewport');
    const outlet = Symbol('outlet');

    expect(center.claimHost(viewport, 0)).toBe(true);
    expect(center.getHostOwner()).toBe(viewport);
    expect(listener).toHaveBeenCalledTimes(1);

    expect(center.claimHost(outlet, 2)).toBe(true);
    expect(center.claimHost(viewport, 0)).toBe(false);
    expect(center.getHostOwner()).toBe(outlet);
    expect(listener).toHaveBeenCalledTimes(2);

    center.releaseHost(viewport); // not the owner → no change
    expect(center.getHostOwner()).toBe(outlet);
    expect(listener).toHaveBeenCalledTimes(2);

    center.releaseHost(outlet);
    expect(center.getHostOwner()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
