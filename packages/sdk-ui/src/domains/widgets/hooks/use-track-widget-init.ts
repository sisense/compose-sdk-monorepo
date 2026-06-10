import { useEffect, useRef } from 'react';

import type { TrackingEventDetails } from '@sisense/sdk-tracking';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useTracking } from '@/shared/hooks/use-tracking';

import type { WidgetType } from '../components/widget/types';

const action = 'sdkWidgetInit';

interface WidgetInitEventDetails extends TrackingEventDetails {
  widgetType: WidgetType;
  widgetName: string;
  widgetTitle: string | null;
  entityId: string;
  entityType: 'widget';
  eventType: 'action';
  featureName: 'composesdk';
  packageName: string;
  packageVersion: string;
}

/**
 * Fully resolved options for {@link useTrackWidgetInit}. The caller (a leaf widget) is
 * responsible for deriving each field from its own props so the hook stays free of
 * widget-shape concerns and runtime type casts.
 *
 * @internal
 */
export type UseTrackWidgetInitOptions = {
  /** Widget type (chart / pivot / text / custom). */
  widgetType: WidgetType;
  /** Resolved widget kind — chart subtype, plugin name, or fixed string for pivot/text. */
  widgetName: string;
  /** Widget title entered by the designer, or `null` if absent. */
  widgetTitle: string | null;
  /** Stable unique widget identifier — the widget id/OID when available, otherwise a content hash. */
  entityId: string;
  /**
   * When `false`, the event is suppressed. Pass the caller's render preconditions here
   * (e.g. `!!(chartType && dataOptions)` for `ChartWidget`) so we do not count mounts
   * whose render body early-returns `null`. The event fires once when this flips to `true`.
   *
   * @default true
   */
  enabled?: boolean;
};

/**
 * Fires the `sdkWidgetInit` tracking event exactly once per widget mount.
 *
 * Behavioral note: unlike `useTrackComponentInit`, this hook intentionally
 * IGNORES `TrackingContextProvider`'s skip-nested signal. Widgets rendered inside
 * a tracked parent (e.g. a `<Dashboard>`) must still emit `sdkWidgetInit`, since
 * the event must count every widget render regardless of nesting.
 *
 * The payload includes envelope overrides (`eventType: 'action'`,
 * `featureName: 'composesdk'`, `entityType: 'widget'`) that override the defaults
 * set by `trackProductEvent`, as required by the data-tracking spec.
 *
 * `widgetTitle` is emitted as `null` rather than `undefined` when absent, matching the
 * spec's "null or [empty]" wire convention.
 *
 * @internal
 */
export const useTrackWidgetInit = (options: UseTrackWidgetInitOptions): void => {
  const { widgetType, widgetName, widgetTitle, entityId, enabled = true } = options;
  const { tracking, app } = useSisenseContext();
  const { trackEvent } = useTracking();

  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;
    if (!tracking || !app) return;
    if (hasTrackedRef.current) return;

    // Atomic guard-and-set: flip the ref BEFORE calling trackEvent so any concurrent
    // effect re-run (e.g. a dep change while the previous request is still in flight)
    // sees the flag as already set and skips a duplicate dispatch.
    hasTrackedRef.current = true;

    const payload: WidgetInitEventDetails = {
      widgetType,
      widgetName,
      widgetTitle,
      entityId,
      entityType: 'widget',
      eventType: 'action',
      featureName: 'composesdk',
      packageName: tracking.packageName,
      packageVersion: __PACKAGE_VERSION__,
    };

    void trackEvent(action, payload, !tracking.enabled);
  }, [enabled, widgetType, widgetName, widgetTitle, entityId, tracking, app, trackEvent]);
};
