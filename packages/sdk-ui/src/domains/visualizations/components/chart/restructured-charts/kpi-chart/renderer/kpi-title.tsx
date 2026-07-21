import { RefObject } from 'react';

import { useThemeContext } from '@/infra/contexts/theme-provider/index.js';

import { PeriodText, TitleArea, TitleText } from './kpi-card-styles.js';

/**
 * Defines the props of {@link KpiTitle}.
 * @internal
 */
export type KpiTitleProps = {
  /** Title text -- the design option override, or the value measure's own title. */
  title: string;
  /** Whether the title text is shown at all (`designOptions.title.enabled`). */
  enabled: boolean;
  /** Formatted current-period caption (e.g. `'Jun 2026'`), shown when the headline is a single bucket. */
  period?: string;
  /** Whether the card has a custom background, so text needs to contrast against it instead of the theme. */
  onColor: boolean;
  /**
   * External ref to `TitleArea`, so the orchestrator can measure its height as an input to the
   * headline auto-fit budget on sparkline cards (see `kpi-chart-renderer.tsx`). Stays unattached
   * when the component renders nothing -- an absent title measures as zero, which is exactly
   * what the budget arithmetic expects.
   */
  areaRef?: RefObject<HTMLDivElement | null>;
};

/**
 * Renders the KPI card's header: the title text and, when present, the current-period caption.
 * Renders nothing when there's neither a title to show nor a period caption.
 * @internal
 */
export function KpiTitle({ title, enabled, period, onColor, areaRef }: KpiTitleProps) {
  const { themeSettings } = useThemeContext();

  if (!enabled && !period) {
    return null;
  }

  return (
    <TitleArea ref={areaRef} data-kpi-area="title">
      {enabled && (
        <TitleText theme={themeSettings} $onColor={onColor}>
          {title}
        </TitleText>
      )}
      {period && (
        <PeriodText theme={themeSettings} $onColor={onColor}>
          {period}
        </PeriodText>
      )}
    </TitleArea>
  );
}
