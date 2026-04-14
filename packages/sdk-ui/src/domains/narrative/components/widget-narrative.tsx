import { useTranslation } from 'react-i18next';

import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { LoadingOverlay } from '@/shared/components/loading-overlay.js';

import type { WidgetNarrativeOptions } from '../core/widget-narrative-options.js';
import { useWidgetNarrativeState } from '../hooks/use-widget-narrative-state.js';
import { NarrativeCollapsible } from './narrative-collapsible.js';
import { NarrativeTopSlotShell } from './narrative-top-slot-shell.js';
import { WidgetNarrativeInteractive } from './widget-narrative-interactive.js';

/**
 * Props for {@link WidgetNarrative}.
 *
 * @sisenseInternal
 */
export type WidgetNarrativeProps = {
  /** Widget whose query drives the narrative (chart or pivot). */
  widgetProps: WidgetProps;
  /**
   * `default` — collapsible narrative with AI feedback actions (same pattern as NLQ chart insights).
   * `plain` — collapsible text only (similar to the `GetNlgInsights` component).
   */
  variant?: 'default' | 'plain';
  /** When false, the narrative query does not run (see {@link useWidgetNarrativeState}). */
  enabled?: boolean;
} & WidgetNarrativeOptions;

/**
 * Renders a natural-language narrative for chart or pivot `WidgetProps`. The request uses the same
 * JAQL as the widget query (chart or pivot)—compose it next to or above a `ChartWidget` or
 * `PivotTableWidget` with the same props.
 *
 * @example Widget header slot
 * ```tsx
 * <ChartWidget
 *   {...chartWidgetProps}
 *   topSlot={<WidgetNarrative widgetProps={chartWidgetProps} />}
 * />
 * ```
 * @example Modal or custom layout (headless)
 * ```tsx
 * const { data, isLoading, supported } = useGetWidgetNarrative({ widgetProps });
 * if (!supported) return null;
 * return <DialogContent>{isLoading ? '…' : data}</DialogContent>;
 * ```
 * @sisenseInternal
 */
export const WidgetNarrative = asSisenseComponent({
  componentName: 'WidgetNarrative',
})(function WidgetNarrative({
  widgetProps,
  variant = 'default',
  enabled = true,
  ...options
}: WidgetNarrativeProps) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const {
    data,
    isLoading,
    isError,
    supported,
    narrativeRequest,
    enabled: isNarrativeEnabled,
  } = useWidgetNarrativeState({
    widgetProps,
    enabled,
    ...options,
  });

  if (!supported) {
    return null;
  }

  if (!isNarrativeEnabled) {
    return null;
  }

  if (isError) {
    return <>{t('ai.errors.unexpected')}</>;
  }

  const summary = data ?? t('ai.errors.insightsNotAvailable');
  const collapsibleText = isLoading ? '\u00A0' : summary;

  if (variant === 'plain') {
    return (
      <NarrativeTopSlotShell theme={themeSettings} $horizontalInset>
        <LoadingOverlay isVisible={isLoading}>
          <NarrativeCollapsible text={collapsibleText} />
        </LoadingOverlay>
      </NarrativeTopSlotShell>
    );
  }

  if (!narrativeRequest) {
    return null;
  }

  if (isLoading) {
    return (
      <NarrativeTopSlotShell theme={themeSettings}>
        <LoadingOverlay isVisible={isLoading}>
          <NarrativeCollapsible text={collapsibleText} />
        </LoadingOverlay>
      </NarrativeTopSlotShell>
    );
  }

  return <WidgetNarrativeInteractive narrativeRequest={narrativeRequest} summary={summary} />;
});
