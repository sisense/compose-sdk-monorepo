import { describe, expect, it } from 'vitest';

import { normalizeSystemSettings } from './helpers';

describe('normalizeSystemSettings', () => {
  it('maps wire displayName to displayNameConfig', () => {
    const config = { enabled: true, useNewSearchByDisplayNameApi: true };
    expect(
      normalizeSystemSettings({
        tracking: { apiTelemetry: false },
        displayName: config,
      }),
    ).toEqual({
      tracking: { apiTelemetry: false },
      displayNameConfig: config,
    });
  });

  it('keeps displayNameConfig when already normalized', () => {
    const config = { enabled: false, useNewSearchByDisplayNameApi: false };
    expect(
      normalizeSystemSettings({
        displayNameConfig: config,
      }),
    ).toEqual({ displayNameConfig: config });
  });

  it('prefers displayNameConfig over wire displayName when both are present', () => {
    const fromConfig = { enabled: true, useNewSearchByDisplayNameApi: true };
    const fromWire = { enabled: false, useNewSearchByDisplayNameApi: false };
    expect(
      normalizeSystemSettings({
        displayName: fromWire,
        displayNameConfig: fromConfig,
      }),
    ).toEqual({ displayNameConfig: fromConfig });
  });

  it('returns undefined for nullish input', () => {
    expect(normalizeSystemSettings(undefined)).toBeUndefined();
    expect(normalizeSystemSettings(null)).toBeUndefined();
  });
});
