import type { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { resolveNotificationText } from './resolve-notification-text';

describe('resolveNotificationText', () => {
  it('returns an empty string for undefined', () => {
    const t = vi.fn() as unknown as TFunction;

    expect(resolveNotificationText(undefined, t)).toBe('');
    expect(t).not.toHaveBeenCalled();
  });

  it('passes a plain string through unchanged', () => {
    const t = vi.fn() as unknown as TFunction;

    expect(resolveNotificationText('Custom message', t)).toBe('Custom message');
    expect(t).not.toHaveBeenCalled();
  });

  it('resolves a translation reference via the given t function', () => {
    const t = vi.fn(() => 'Translated title') as unknown as TFunction;

    expect(resolveNotificationText({ key: 'notifications.auth.sessionExpiredTitle' }, t)).toBe(
      'Translated title',
    );
    expect(t).toHaveBeenCalledWith('notifications.auth.sessionExpiredTitle', {});
  });

  it('forwards the namespace as the `ns` option', () => {
    const t = vi.fn(() => 'Translated') as unknown as TFunction;

    resolveNotificationText({ key: 'custom.title', namespace: 'myApp' }, t);

    expect(t).toHaveBeenCalledWith('custom.title', { ns: 'myApp' });
  });

  it('forwards interpolation params', () => {
    const t = vi.fn(() => 'Translated') as unknown as TFunction;

    resolveNotificationText({ key: 'custom.title', params: { name: 'Ada' } }, t);

    expect(t).toHaveBeenCalledWith('custom.title', { name: 'Ada' });
  });

  it('forwards both namespace and params together', () => {
    const t = vi.fn(() => 'Translated') as unknown as TFunction;

    resolveNotificationText(
      { key: 'custom.title', namespace: 'myApp', params: { name: 'Ada' } },
      t,
    );

    expect(t).toHaveBeenCalledWith('custom.title', { name: 'Ada', ns: 'myApp' });
  });
});
