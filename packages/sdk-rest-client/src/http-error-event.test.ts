import { describe, expect, it, vi } from 'vitest';

import { asHttpErrorKind, emitHttpError, type HttpErrorEvent } from './http-error-event.js';
import { TranslatableError } from './translation/translatable-error.js';

describe('asHttpErrorKind', () => {
  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [500, 'server'],
    [503, 'server'],
    [400, 'client'],
    [404, 'client'],
  ] as const)('maps status %i to %s', (status, kind) => {
    expect(asHttpErrorKind(status)).toBe(kind);
  });
});

describe('emitHttpError', () => {
  const event: HttpErrorEvent = {
    kind: 'forbidden',
    status: 403,
    url: 'https://10.0.0.1/api/v1/x',
    method: 'GET',
    authType: 'bearer',
    error: new TranslatableError('errors.forbidden', { status: '403' }),
  };

  it('does nothing without a listener', () => {
    expect(() => emitHttpError({ url: event.url, method: 'GET' }, event)).not.toThrow();
  });

  it('calls the listener with the event', () => {
    const onError = vi.fn();
    emitHttpError({ url: event.url, method: 'GET', onError }, event);
    expect(onError).toHaveBeenCalledWith(event);
  });

  it('swallows listener errors and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onError = vi.fn(() => {
      throw new Error('listener boom');
    });
    expect(() => emitHttpError({ url: event.url, method: 'GET', onError }, event)).not.toThrow();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
