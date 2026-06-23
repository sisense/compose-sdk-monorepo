import { createContext, useContext } from 'react';

/**
 * Context value for tracking narrative readiness across widgets in a dashboard.
 * @internal
 */
export type NarrativeReadinessContextValue = {
  /** Called by each WidgetNarrative instance when its loading state settles (success or error). */
  notifyNarrativeDone: (widgetId: string) => void;
};

/**
 * Context that allows the Dashboard to aggregate narrative completion signals
 * from individual WidgetNarrative instances without requiring prop drilling.
 * @internal
 */
export const NarrativeReadinessContext = createContext<NarrativeReadinessContextValue | null>(null);

/**
 * Returns the current NarrativeReadinessContext value, or null when rendered
 * outside a Dashboard (e.g. standalone WidgetNarrative usage).
 * @internal
 */
export const useNarrativeReadinessContext = (): NarrativeReadinessContextValue | null =>
  useContext(NarrativeReadinessContext);
