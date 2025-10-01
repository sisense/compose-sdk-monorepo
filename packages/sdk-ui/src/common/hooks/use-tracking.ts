import { useSisenseContext } from '@/sisense-context/sisense-context';
import { HttpClient } from '@ethings-os/sdk-rest-client';
import {
  ErrorEventOptions,
  eventRegistry,
  TrackingEventType,
  TrackingEventDetails,
  trackProductEvent,
} from '@ethings-os/sdk-tracking';
import { useCallback } from 'react';

export const executeTracking = (
  eventType: TrackingEventType,
  eventPayload: TrackingEventDetails,
  httpClient: HttpClient,
  onTrackingEvent?: (payload: TrackingEventDetails) => void,
  isDebugMode?: boolean,
) => {
  const eventConfig = eventRegistry[`${eventType}`];

  if (eventConfig.internal) {
    trackProductEvent(eventType, eventPayload, httpClient, isDebugMode);
  }

  if (eventConfig.external && !!onTrackingEvent) {
    onTrackingEvent({ action: eventType, ...eventPayload });
  }

  return Promise.resolve();
};

export const useTracking = () => {
  const { tracking, app } = useSisenseContext();
  const authType = app?.httpClient?.auth?.type;
  const trackEvent = useCallback(
    (
      eventType: TrackingEventType,
      eventPayload: TrackingEventDetails = {},
      isDebugMode = false,
    ) => {
      if (!app) return Promise.resolve();

      return executeTracking(
        eventType,
        { ...eventPayload, authType },
        app.httpClient,
        tracking.onTrackingEvent,
        isDebugMode,
      );
    },
    [tracking, app, authType],
  );

  const trackError = useCallback(
    (options: ErrorEventOptions, isDebugMode = false) => {
      if (!app) return Promise.resolve();

      const { packageName, packageVersion, component, error } = options;
      let errorMessage = '';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message || error.toString();
      }

      const payload = {
        packageName,
        packageVersion,
        component,
        error: errorMessage,
      };
      return executeTracking(
        'sdkError',
        { ...payload, authType },
        app.httpClient,
        tracking.onTrackingEvent,
        isDebugMode,
      );
    },
    [tracking, app, authType],
  );

  return {
    trackEvent,
    trackError,
  };
};
