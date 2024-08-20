/* eslint-disable max-params */
import { HttpClient } from '@sisense/sdk-rest-client';
import { TrackingEventType } from './registry.js';

const TRACKING_CATEGORY = 'composesdk';

export type TrackingEventDetails = Record<string, number | string | boolean | undefined>;

export const trackProductEvent = (
  action: TrackingEventType,
  details: TrackingEventDetails,
  httpClient: HttpClient,
  isDebugMode = false,
) => {
  const payload = {
    action,
    cat: TRACKING_CATEGORY,
    eventType: 'product',
    direct: true,
    ...details,
  };
  if (isDebugMode) {
    console.debug('DEBUG: event payload to send', payload);
    return Promise.resolve();
  }

  return httpClient
    .post<undefined>('api/activities/', [payload], {
      cache: 'no-store', // don't cache these requests, let them hit the server directly
      redirect: 'error', // catch server redirects in the networking tab as potential mistakes
      referrerPolicy: 'same-origin', // capture the same-origin URL from which this method was called
      priority: 'low', // Tracking requests can be low priority
    })
    .catch((e) => {
      console.error(`unable to log action=${action}, category=${TRACKING_CATEGORY}`, e);
    });
};

export type ErrorEventOptions = {
  packageName: 'sdk-ui' | 'sdk-cli';
  packageVersion: string;
  component: string;
  error: string | Error;
};

const trackError = (options: ErrorEventOptions, httpClient: HttpClient) => {
  const { packageName, packageVersion, component, error } = options;
  let errorMessage = '';
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message || error.toString();
  }

  return trackProductEvent(
    'sdkError',
    {
      packageName,
      packageVersion,
      component,
      error: errorMessage,
    },
    httpClient,
  );
};

export const trackUiError = (
  options: Omit<ErrorEventOptions, 'packageName'>,
  httpClient: HttpClient,
) => trackError({ ...options, packageName: 'sdk-ui' }, httpClient);

export const trackCliError = (
  options: Omit<ErrorEventOptions, 'packageName'>,
  httpClient: HttpClient,
) => trackError({ ...options, packageName: 'sdk-cli' }, httpClient);

declare global {
  interface RequestInit {
    priority?: 'high' | 'low' | 'auto';
  }
}
