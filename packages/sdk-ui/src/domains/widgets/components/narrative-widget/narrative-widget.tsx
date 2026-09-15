import { type FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { Narrative, type NarrativeState } from '@/domains/narrative/components/narrative';
import { withHeaderItemsInConfig } from '@/domains/widgets/helpers/header-items-utils.js';
import { useTrackWidgetInit } from '@/domains/widgets/hooks/use-track-widget-init';
import { getWidgetEntityId } from '@/domains/widgets/hooks/widget-entity-id';
import {
  getNarrativeWidgetName,
  getWidgetTitle,
} from '@/domains/widgets/hooks/widget-tracking-adapters';
import { WidgetContainer } from '@/domains/widgets/shared/widget-container/widget-container.js';
import { useWidgetHeaderMenu } from '@/domains/widgets/shared/widget-header/features/use-widget-header-menu';
import { useWidgetHeaderTitle } from '@/domains/widgets/shared/widget-header/features/use-widget-header-title';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { useQuotaNotification } from '@/shared/hooks/use-quota-notification';

import { createNarrativeCopyItem } from './copy-header-item.js';
import type { NarrativeWidgetProps } from './types.js';

function initialStateFor(narrative: NarrativeWidgetProps['narrative']): NarrativeState {
  return narrative ? { status: 'ready', data: narrative } : { status: 'idle' };
}

/**
 * Widget component that renders an AI-generated, natural-language summary of the dashboard
 * it sits on. Owns the narrative state machine; the surrounding container and header are the
 * standard widget chrome, with the copy action as a header item.
 *
 * Inside a `Dashboard` the widgets it describes are injected automatically; the narrative
 * API is not wired yet, so generating lands in the retryable failed state.
 * @example
 * ```tsx
 * <Dashboard
 *   title="Sales"
 *   widgets={[
 *     { id: 'narrative', widgetType: 'narrative', title: 'Dashboard Narrative' },
 *     { id: 'revenue', widgetType: 'chart', chartType: 'line', dataSource: DM.DataSource, dataOptions },
 *   ]}
 * />
 * ```
 * @param props - Dashboard narrative widget props
 * @returns Dashboard narrative widget component
 * @group Dashboards
 * @alpha
 */
export const NarrativeWidget: FunctionComponent<NarrativeWidgetProps> = asSisenseComponent({
  componentName: 'NarrativeWidget',
  shouldSkipSisenseContextWaiting: true,
})((props) => {
  const {
    title,
    styleOptions,
    config,
    containerless = false,
    narrative,
    onReady,
    onStateChange,
    onChange,
  } = props;

  // Reads the AI credit balance and owns the 85 % threshold; returns nothing unless the
  // tenant is on a Sisense-managed model with quota notifications on. Needs a
  // QueryClientProvider ancestor, which SisenseContextProvider supplies.
  const { quotaState } = useQuotaNotification();

  const headerConfigWithTitle = useWidgetHeaderTitle(config?.header, {
    title,
    styleOptions: styleOptions?.header,
    onChange,
  });

  useTrackWidgetInit({
    widgetType: 'narrative',
    widgetName: getNarrativeWidgetName(),
    widgetTitle: getWidgetTitle(props),
    entityId: getWidgetEntityId(props, 'narrative', getNarrativeWidgetName()),
  });

  const [state, setState] = useState<NarrativeState>(() => initialStateFor(narrative));

  // With nothing generated yet a spent allowance leaves no action to offer, so it presents as the
  // error state; a narrative already on screen stays and only the regenerate action goes dead.
  const effectiveState = useMemo(
    (): NarrativeState =>
      state.status === 'idle' && quotaState?.isExceeded
        ? { status: 'error', kind: 'quota-exceeded' }
        : state,
    [state, quotaState?.isExceeded],
  );

  const quotaWarning =
    quotaState && (quotaState.isWarning || quotaState.isExceeded)
      ? { usagePercentage: quotaState.usagePercentage, exceeded: quotaState.isExceeded }
      : undefined;

  useEffect(() => {
    onReady?.();
    // Fires once per mount regardless of later prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (narrative) {
      setState({ status: 'ready', data: narrative });
    }
  }, [narrative]);

  useEffect(() => {
    onStateChange?.(effectiveState);
  }, [effectiveState, onStateChange]);

  // The narrative API is not wired up yet; without a pre-supplied narrative, generating
  // lands in the retryable failed state.
  const generate = useCallback(() => {
    setState(
      narrative ? { status: 'ready', data: narrative } : { status: 'error', kind: 'failed' },
    );
  }, [narrative]);

  const copyText = effectiveState.status === 'ready' ? effectiveState.data.copyText : undefined;

  // No info button: it shows the data source and refresh, which do not apply to a widget that
  // runs no query.
  const headerConfigWithCopy = useMemo(
    () =>
      copyText === undefined
        ? headerConfigWithTitle
        : withHeaderItemsInConfig([createNarrativeCopyItem({ copyText })])(headerConfigWithTitle),
    [headerConfigWithTitle, copyText],
  );

  const fullHeaderConfig = useWidgetHeaderMenu(headerConfigWithCopy);

  const content = (
    <Narrative
      state={effectiveState}
      quotaWarning={quotaWarning}
      onGenerate={generate}
      // The host that owns the chrome also owns the loading treatment.
      showLoadingOverlay={!containerless}
    />
  );

  // In Fusion-hosted contexts the host provides the widget chrome (header, menu, edit).
  // Skip WidgetContainer to avoid a double header; the host also owns the copy action there.
  if (containerless) return content;

  return (
    <WidgetContainer styleOptions={styleOptions} headerConfig={fullHeaderConfig}>
      {content}
    </WidgetContainer>
  );
});
