import type { DisplayNameConfig } from '@sisense/sdk-query-client/dispatcher';

import { AppConfig, SystemSettings } from './types';

/**
 * Raw JSON shape of `GET api/v1/settings/system` (Fusion wire key is `displayName`).
 *
 * @internal
 */
export type SystemSettingsWire = {
  tracking?: SystemSettings['tracking'];
  displayName?: DisplayNameConfig;
  /** Already-normalized payloads are accepted for convenience. */
  displayNameConfig?: DisplayNameConfig;
};

/**
 * Maps Fusion system-settings JSON to {@link SystemSettings}.
 * Wire key `displayName` becomes CSDK `displayNameConfig`.
 *
 * @param wire - Raw API response (or already-normalized settings)
 * @returns Normalized system settings
 * @internal
 */
export function normalizeSystemSettings(
  wire: SystemSettingsWire | null | undefined,
): SystemSettings | undefined {
  if (wire == null) {
    return undefined;
  }
  return {
    ...(wire.tracking !== undefined ? { tracking: wire.tracking } : {}),
    ...(wire.displayNameConfig !== undefined || wire.displayName !== undefined
      ? { displayNameConfig: wire.displayNameConfig ?? wire.displayName }
      : {}),
  };
}

/**
 * Checks if the API Telemetry feature is enabled
 *
 * @param systemSettings - System settings from `api/v1/settings/system`
 * @returns True if the API Telemetry feature is enabled, false otherwise
 */
export function isApiTelemetryEnabled(systemSettings?: Pick<SystemSettings, 'tracking'>) {
  return systemSettings?.tracking?.apiTelemetry ?? false;
}

/**
 * Prepares the API Telemetry headers
 *
 * @param appConfig - App config
 * @param isFusionAuth - Whether the application is using Fusion authentication
 * @returns The API Telemetry headers
 */
export function prepareApiTelemetryHeaders(
  packageName: string,
  appConfig?: AppConfig,
  isFusionAuth = false,
) {
  const headers: Record<string, string> = {
    'x-sisense-sdk': `csdk-${packageName}`,
  };
  if (isFusionAuth) {
    headers['x-sisense-origin'] = 'fusion-ui';
  } else {
    headers['x-sisense-embed'] = 'compose-sdk';
  }

  if (appConfig?.apiTelemetryHeaders) {
    for (const [key, value] of Object.entries(appConfig.apiTelemetryHeaders)) {
      if (key.startsWith('x-sisense-')) {
        headers[key] = value;
      }
    }
  }

  return headers;
}
