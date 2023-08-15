/* eslint-disable max-params */
import { HttpClient } from '@sisense/sdk-rest-client';

const TRACKING_CATEGORY = 'composesdk';

export type TrackingDetails = Record<string, number | string | boolean | undefined>;

export const trackProductEvent = async (
  action: string,
  details: TrackingDetails,
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
    console.log('DEBUG: event payload to send', payload);
    return;
  }

  return httpClient
    .post('api/activities/', [payload], {
      cache: 'no-store', // don't cache these requests, let them hit the server directly
      redirect: 'error', // catch server redirects in the networking tab as potential mistakes
      referrerPolicy: 'same-origin', // capture the same-origin URL from which this method was called
    })
    .catch((e) => {
      // Our HttpClient always parses responses from Sisense APIs as JSON, but
      // for some reason, this endpoint returns an empty text response on
      // success. Swallow this error since (so far) this is the only endpoint
      // that behaves like this.
      if (e instanceof SyntaxError && e.message === 'Unexpected end of JSON input') {
        return;
      }

      console.error(`unable to log action=${action}, category=${TRACKING_CATEGORY}`, e);
    });
};
