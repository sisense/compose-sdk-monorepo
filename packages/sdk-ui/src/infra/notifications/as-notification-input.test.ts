import type { HttpErrorEvent } from '@sisense/sdk-rest-client';
import { describe, expect, it } from 'vitest';

import { asNotificationInput } from './as-notification-input';

const baseEvent = {
  url: 'https://example.com/api/v1/things',
  method: 'GET',
  // The mapper never reads the error beyond passing it through as `cause`.
  error: new Error('boom') as unknown as HttpErrorEvent['error'],
};

const event = (overrides: Partial<HttpErrorEvent>): HttpErrorEvent => ({
  ...baseEvent,
  kind: 'client',
  status: 400,
  authType: 'bearer',
  ...overrides,
});

describe('asNotificationInput', () => {
  it.each([
    ['unauthorized', 'sso', 'auth.sessionExpired', 'auth'],
    ['unauthorized', 'fusion', 'auth.sessionExpired', 'auth'],
    ['unauthorized', 'bearer', 'auth.authenticationFailed', 'auth'],
    ['unauthorized', 'wat', 'auth.authenticationFailed', 'auth'],
    ['unauthorized', 'password', 'auth.authenticationFailed', 'auth'],
    ['forbidden', 'bearer', 'permission.forbidden', 'permission'],
  ] as const)('maps %s (%s) to %s by default', (kind, authType, code, category) => {
    const input = asNotificationInput(event({ kind, authType }));
    expect(input).toMatchObject({
      code,
      category,
      severity: 'error',
      title: { key: expect.stringMatching(/^notifications\./) },
      message: { key: expect.stringMatching(/^notifications\./) },
      cause: baseEvent.error,
    });
  });

  it('uses distinct title/message keys per code', () => {
    expect(asNotificationInput(event({ kind: 'unauthorized', authType: 'sso' }))).toMatchObject({
      title: { key: 'notifications.auth.sessionExpiredTitle' },
      message: { key: 'notifications.auth.sessionExpiredMessage' },
    });
    expect(asNotificationInput(event({ kind: 'forbidden' }))).toMatchObject({
      title: { key: 'notifications.permission.forbiddenTitle' },
      message: { key: 'notifications.permission.forbiddenMessage' },
    });
  });

  it.each([
    ['network', 'network.unreachable'],
    ['server', 'server.error'],
    ['client', 'general.requestFailed'],
  ] as const)(
    'drops %s by default but maps it to %s when its category is enabled',
    (kind, code) => {
      expect(asNotificationInput(event({ kind }))).toBeUndefined();
      const category = code.split('.')[0] as 'network' | 'server' | 'general';
      expect(
        asNotificationInput(event({ kind }), { categories: { [category]: true } }),
      ).toMatchObject({ code, category });
    },
  );

  it('drops auth and permission when explicitly disabled', () => {
    expect(
      asNotificationInput(event({ kind: 'unauthorized' }), { categories: { auth: false } }),
    ).toBeUndefined();
    expect(
      asNotificationInput(event({ kind: 'forbidden' }), { categories: { permission: false } }),
    ).toBeUndefined();
  });

  it('attaches the configured auth action to auth notifications only', () => {
    const action = { label: 'Log in again', onClick: () => {} };
    expect(
      asNotificationInput(event({ kind: 'unauthorized' }), { actions: { auth: action } })?.action,
    ).toBe(action);
    expect(
      asNotificationInput(event({ kind: 'forbidden' }), { actions: { auth: action } })?.action,
    ).toBeUndefined();
  });
});
