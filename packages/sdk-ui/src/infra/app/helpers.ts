import { AppConfig, SystemSettings } from './types';

/**
 * Checks if the API Telemetry feature is enabled
 *
 * @param systemSettings - System settings
 * @returns True if the API Telemetry feature is enabled, false otherwise
 */
export function isApiTelemetryEnabled(systemSettings?: SystemSettings) {
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
