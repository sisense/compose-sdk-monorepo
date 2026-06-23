import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils.js';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import type { HookEnableParam } from '@/shared/hooks/types';

import { getWidgetNarrativeOptionsFromWidgetProps } from '../core/get-widget-narrative-from-widget-props.js';
import { getCompleteWidgetNarrativeOptions } from '../core/widget-narrative-options.js';
import { useWidgetNarrativeState } from '../hooks/use-widget-narrative-state.js';
import { NarrativeCollapsible } from './narrative-collapsible.js';
import {
  NARRATIVE_TOP_SLOT_PADDING_TOP,
  NarrativeTopSlotShell,
} from './narrative-top-slot-shell.js';
import {
  IconDiv,
  NarrativeAiIcon,
  NarrativeTopSlotRow,
  WidgetNarrativeInteractive,
} from './widget-narrative-interactive.js';

/**
 * Props for {@link WidgetNarrative}.
 *
 * @remarks
 * Narrative options are read from `widgetProps.aiOptions.narrative` for chart and pivot widgets.
 * Accepts {@link HookEnableParam}; `enabled` is forwarded to {@link useWidgetNarrativeState}.
 * @sisenseInternal
 */
export type WidgetNarrativeProps = {
  /** Widget whose query drives the narrative (chart or pivot). */
  widgetProps: WidgetProps;
  /** Fired when the collapsed state of the narrative text changes (expand/collapse mode only). */
  onCollapsedChange?: (isCollapsed: boolean) => void;
  /** Forwarded to {@link NarrativeCollapsible} — external height constraint in pixels. */
  constrainedHeightPx?: number;
  /** Forwarded to {@link NarrativeCollapsible} — max height constraint in pixels. (Limit after 'show more' is expanded) */
  maxConstrainedHeightPx?: number;
} & HookEnableParam;

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
  enabled = true,
  onCollapsedChange,
  constrainedHeightPx,
  maxConstrainedHeightPx,
}: WidgetNarrativeProps) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();

  const { feedbackEnabled, isDisplayedAlone } = useMemo(() => {
    if (!isChartWidgetProps(widgetProps) && !isPivotTableWidgetProps(widgetProps)) {
      return { feedbackEnabled: false, isDisplayedAlone: false };
    }
    const completeOptions = getCompleteWidgetNarrativeOptions(
      getWidgetNarrativeOptionsFromWidgetProps(widgetProps),
    );
    return {
      feedbackEnabled: completeOptions.feedback.enabled,
      isDisplayedAlone: completeOptions.displayLocation === 'alone',
    };
  }, [widgetProps]);

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
  });

  if (!supported) {
    return null;
  }

  if (!isNarrativeEnabled) {
    return null;
  }

  const summary = data ?? t('ai.errors.insightsNotAvailable');

  const narrativeRow = (
    <NarrativeTopSlotRow>
      <IconDiv theme={themeSettings}>
        <NarrativeAiIcon theme={themeSettings} />
      </IconDiv>
      <NarrativeCollapsible
        isError={isError}
        text={summary}
        isLoading={isLoading}
        noCollapse={isDisplayedAlone}
        onCollapsedChange={onCollapsedChange}
        constrainedHeightPx={constrainedHeightPx}
        maxConstrainedHeightPx={
          maxConstrainedHeightPx
            ? maxConstrainedHeightPx - NARRATIVE_TOP_SLOT_PADDING_TOP
            : undefined
        }
      />
    </NarrativeTopSlotRow>
  );

  if (!feedbackEnabled) {
    return <NarrativeTopSlotShell theme={themeSettings}>{narrativeRow}</NarrativeTopSlotShell>;
  }

  if (!narrativeRequest) {
    return null;
  }

  if (isLoading) {
    return <NarrativeTopSlotShell theme={themeSettings}>{narrativeRow}</NarrativeTopSlotShell>;
  }

  return (
    <WidgetNarrativeInteractive
      isError={isError}
      isLoading={isLoading}
      narrativeRequest={narrativeRequest}
      text={summary}
      noCollapse={isDisplayedAlone}
      onCollapsedChange={onCollapsedChange}
      constrainedHeightPx={constrainedHeightPx}
      maxConstrainedHeightPx={
        maxConstrainedHeightPx ? maxConstrainedHeightPx - NARRATIVE_TOP_SLOT_PADDING_TOP : undefined
      }
    />
  );
});
