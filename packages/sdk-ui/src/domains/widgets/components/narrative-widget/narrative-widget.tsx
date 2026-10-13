import { type FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Narrative, type NarrativeState } from '@/domains/narrative/components/narrative';
import { useNarrativeWidgetState } from '@/domains/narrative/hooks/use-narrative-widget-state.js';
import { useTrackNarrativeCopy } from '@/domains/narrative/hooks/use-track-narrative-copy.js';
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
import { getWidgetOverheadHeight } from '@/domains/widgets/shared/widget-style-utils';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { useElementHeight } from '@/shared/hooks/use-element-height';
import { useQuotaNotification } from '@/shared/hooks/use-quota-notification';

import { createNarrativeCopyItem } from './copy-header-item.js';
import type { NarrativeWidgetProps } from './types.js';

/**
 * Widget component that renders an AI-generated, natural-language summary of the dashboard
 * it sits on. Generating sends the sibling widgets' queries to the narrative service and renders
 * the answer; the surrounding container and header are the standard widget chrome, with the copy
 * action as a header item.
 *
 * Inside a `Dashboard` the widgets it describes are injected automatically; standalone, pass them
 * through `widgets` — with none there is nothing to narrate and generating reports no data. With
 * `dashboardId` the saved dashboard is requested by id instead, and `widgets` is not sent.
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
 * @param props - Dashboard narrative widget props.
 * @returns Dashboard narrative widget component.
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
    widgets,
    dashboardId,
    sharedMode,
    adminAccess,
    generateOnMount = false,
    onReady,
    onStateChange,
    onContentHeightChange,
    onChange,
  } = props;

  // Reads the AI credit balance and owns the 85 % threshold; returns nothing unless the
  // tenant is on a Sisense-managed model with quota notifications on. An unlimited narrative
  // entitlement draws no credits, so its balance says nothing about this widget — including a
  // balance another consumer of the same query already cached. Needs a QueryClientProvider
  // ancestor, which SisenseContextProvider supplies.
  const { app } = useSisenseContext();
  const isUnlimited = app?.settings?.narrative?.isUnlimited === true;
  const { quotaState: creditQuotaState } = useQuotaNotification({ enabled: !isUnlimited });
  const quotaState = isUnlimited ? null : creditQuotaState;

  const headerConfigWithTitle = useWidgetHeaderTitle(config?.header, {
    title,
    styleOptions: styleOptions?.header,
    onChange,
  });

  const widgetEntityId = getWidgetEntityId(props, 'narrative', getNarrativeWidgetName());
  useTrackWidgetInit({
    widgetType: 'narrative',
    widgetName: getNarrativeWidgetName(),
    widgetTitle: getWidgetTitle(props),
    entityId: widgetEntityId,
  });
  const trackCopy = useTrackNarrativeCopy({ dashboardId, widgetEntityId });

  const { state, generate } = useNarrativeWidgetState({
    widgets,
    dashboardId,
    sharedMode,
    adminAccess,
    generateOnMount,
  });

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

  // Generating on mount holds the host's render pipeline until the narrative (or its error) is on
  // screen, so an export prints it rather than the loading state.
  const isSettled = !generateOnMount || (state.status !== 'idle' && state.status !== 'loading');
  const readyReported = useRef(false);
  useEffect(() => {
    if (!isSettled || readyReported.current) return;
    readyReported.current = true;
    onReady?.();
    // Fires once per mount regardless of later prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSettled]);

  useEffect(() => {
    onStateChange?.(effectiveState);
  }, [effectiveState, onStateChange]);

  const copyText = effectiveState.status === 'ready' ? effectiveState.data.copyText : undefined;

  // No info button: it shows the data source and refresh, which do not apply to a widget that
  // runs no query.
  const headerConfigWithCopy = useMemo(
    () =>
      copyText === undefined
        ? headerConfigWithTitle
        : withHeaderItemsInConfig([createNarrativeCopyItem({ copyText, onCopied: trackCopy })])(
            headerConfigWithTitle,
          ),
    [headerConfigWithTitle, copyText, trackCopy],
  );

  const fullHeaderConfig = useWidgetHeaderMenu(headerConfigWithCopy);

  const { themeSettings } = useThemeContext();
  // With its own container the widget sizes itself to the content, as an auto-height pivot does;
  // a host that draws the chrome (`containerless`) sizes it from `onContentHeightChange` instead.
  const isAutoHeight = !containerless && (styleOptions?.isAutoHeight ?? false);
  const [naturalHeight, setNaturalHeight] = useState<number>();
  // What the container adds around the content (header, divider, borders, space around), measured
  // from the rendered container; estimated from the style until it has rendered once.
  const { ref: outerRef, height: outerHeight } = useElementHeight<HTMLDivElement>();
  const { ref: contentAreaRef, height: contentAreaHeight } = useElementHeight<HTMLDivElement>();
  const handleNaturalHeightChange = useCallback(
    (height: number) => {
      setNaturalHeight(height);
      onContentHeightChange?.(height);
    },
    [onContentHeightChange],
  );

  const content = (
    <Narrative
      state={effectiveState}
      quotaWarning={quotaWarning}
      onGenerate={generate}
      // The host that owns the chrome also owns the loading treatment.
      showLoadingOverlay={!containerless}
      // Generating on mount means nobody is there to click, as in an export.
      showActions={!generateOnMount}
      onNaturalHeightChange={handleNaturalHeightChange}
    />
  );

  // In Fusion-hosted contexts the host provides the widget chrome (header, menu, edit).
  // Skip WidgetContainer to avoid a double header; the host also owns the copy action there.
  if (containerless) return content;

  if (!isAutoHeight) {
    return (
      <WidgetContainer styleOptions={styleOptions} headerConfig={fullHeaderConfig}>
        {content}
      </WidgetContainer>
    );
  }

  const overhead =
    outerHeight > 0 && contentAreaHeight > 0
      ? outerHeight - contentAreaHeight
      : getWidgetOverheadHeight({
          styleOptions,
          themeSettings,
          hasHeader: !styleOptions?.header?.hidden,
        });

  return (
    <div
      ref={outerRef}
      style={naturalHeight === undefined ? undefined : { height: naturalHeight + overhead }}
    >
      <WidgetContainer styleOptions={styleOptions} headerConfig={fullHeaderConfig}>
        <div ref={contentAreaRef} style={{ height: '100%' }}>
          {content}
        </div>
      </WidgetContainer>
    </div>
  );
});
