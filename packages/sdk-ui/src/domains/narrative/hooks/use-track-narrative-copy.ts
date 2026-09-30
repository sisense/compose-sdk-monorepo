import { useCallback } from 'react';

import type { TrackingEventDetails } from '@sisense/sdk-tracking';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useTracking } from '@/shared/hooks/use-tracking';

const action = 'copyDashboardNarrative';

interface NarrativeCopyEventDetails extends TrackingEventDetails {
  cat: 'air';
  featureName: 'dashboardNarratives';
  eventType: 'userAction';
  entityType: 'dashboard' | 'widget';
  entityId: string;
  clickButton: 'true';
}

/**
 * Options for {@link useTrackNarrativeCopy}.
 * @internal
 */
export type UseTrackNarrativeCopyOptions = {
  /** Saved dashboard the narrative describes; the event's entity when set. */
  dashboardId?: string;
  /** Stable id of the narrative widget; the event's entity when there is no dashboard id. */
  widgetEntityId: string;
};

/**
 * Returns the callback that reports a copy of the dashboard narrative as the
 * `copyDashboardNarrative` event. The entity is the saved dashboard when its id is known,
 * otherwise the narrative widget itself.
 * @param options - Dashboard id and widget id the event is attributed to.
 * @returns Callback to invoke once the narrative is on the clipboard.
 * @internal
 */
export const useTrackNarrativeCopy = (options: UseTrackNarrativeCopyOptions): (() => void) => {
  const { dashboardId, widgetEntityId } = options;
  const { tracking, app } = useSisenseContext();
  const { trackEvent } = useTracking();

  return useCallback(() => {
    if (!tracking || !app) return;

    const payload: NarrativeCopyEventDetails = {
      cat: 'air',
      featureName: 'dashboardNarratives',
      eventType: 'userAction',
      ...(dashboardId
        ? { entityType: 'dashboard', entityId: dashboardId }
        : { entityType: 'widget', entityId: widgetEntityId }),
      clickButton: 'true',
    };

    void trackEvent(action, payload, !tracking.enabled);
  }, [dashboardId, widgetEntityId, tracking, app, trackEvent]);
};
