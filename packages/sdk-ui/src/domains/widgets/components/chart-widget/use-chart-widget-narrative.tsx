/* eslint-disable @typescript-eslint/naming-convention */
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { createNarrativeToggleItem } from '@/domains/narrative/components/narrative-toggle-header-item';
import { WidgetNarrative } from '@/domains/narrative/components/widget-narrative';
import { getWidgetNarrativeConfigFromWidgetProps } from '@/domains/narrative/core/get-widget-narrative-from-widget-props.js';
import { getCompleteWidgetNarrativeConfig } from '@/domains/narrative/core/widget-narrative-config';
import type { HeaderItem } from '@/domains/shared/header';
import type { WithCommonWidgetProps } from '@/domains/widgets/components/widget/types';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import type { ChartWidgetStyleOptions } from '@/types';

import type { ChartWidgetProps } from './types';

type UseChartWidgetNarrativeParams = {
  propsWithDrilldown: ChartWidgetProps;
  styleOptions: ChartWidgetStyleOptions | undefined;
};

type UseChartWidgetNarrativeReturn = {
  /** Ref to pass to WidgetContainer — measures the content area for height constraints. */
  contentAreaRef: RefObject<HTMLDivElement | null>;
  /** The built-in narrative-toggle header item; `undefined` when the toggle does not apply. */
  narrativeToggleItem: HeaderItem | undefined;
  /** Narrative element for the top slot; non-null only when displayLocation is `above` and narrative is visible. */
  narrativeTopSlot: ReactNode;
  /** Narrative element for the bottom slot; non-null only when displayLocation is `below` and narrative is visible. */
  narrativeBottomSlot: ReactNode;
  /** Narrative element used as widget content; non-null only when displayLocation is `alone` and narrative is visible. */
  narrativeAloneContent: ReactNode;
};

/**
 * Encapsulates all narrative-related logic for ChartWidget:
 * options resolution, visibility state, trigger-button contribution, and height constraints.
 *
 * @internal
 */
export function useChartWidgetNarrative({
  propsWithDrilldown,
  styleOptions,
}: UseChartWidgetNarrativeParams): UseChartWidgetNarrativeReturn {
  const { app } = useSisenseContext();

  const completeNarrativeConfig = useMemo(
    () =>
      getCompleteWidgetNarrativeConfig(getWidgetNarrativeConfigFromWidgetProps(propsWithDrilldown)),
    [propsWithDrilldown],
  );

  const canGenerateNarrativeViaAI = app?.settings?.narrative?.canGenerateNarrativeViaAI ?? false;

  const [narrativeVisible, setNarrativeVisible] = useState(false);

  const showNarrativeTrigger =
    !!app?.settings?.narrativeConfig?.enabled &&
    canGenerateNarrativeViaAI &&
    completeNarrativeConfig.enabled &&
    !completeNarrativeConfig.autoShow;

  // Contributed as a built-in header item, so it keeps a reserved id that `position` /
  // `onBeforeRender` can address like any other built-in.
  const narrativeToggleItem = useMemo<HeaderItem | undefined>(
    () =>
      showNarrativeTrigger
        ? createNarrativeToggleItem({
            isVisible: narrativeVisible,
            onToggle: () => setNarrativeVisible((v) => !v),
          })
        : undefined,
    [showNarrativeTrigger, narrativeVisible, setNarrativeVisible],
  );

  const narrativeShouldShow =
    !!app?.settings?.narrativeConfig?.enabled &&
    canGenerateNarrativeViaAI &&
    completeNarrativeConfig.enabled &&
    (completeNarrativeConfig.autoShow || narrativeVisible);

  const narrativeWidgetProps = useMemo((): WithCommonWidgetProps<ChartWidgetProps, 'chart'> => {
    const base = propsWithDrilldown as ChartWidgetProps & { id?: string };
    const id = typeof base.id === 'string' ? base.id : '__chartWidgetNarrative__';
    return {
      ...base,
      id,
      widgetType: 'chart',
    };
  }, [propsWithDrilldown]);

  const contentAreaRef = useRef<HTMLDivElement>(null);
  const [contentAreaHeight, setContentAreaHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = contentAreaRef.current;
    if (!el) return;
    setContentAreaHeight(el.clientHeight);
    const obs = new ResizeObserver(() => setContentAreaHeight(el.clientHeight));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const constrainedHeightPx = useMemo(() => {
    const { heightFraction, displayLocation } = completeNarrativeConfig;
    if (
      heightFraction === undefined ||
      displayLocation === 'alone' ||
      contentAreaHeight === undefined
    ) {
      return undefined;
    }
    return heightFraction * contentAreaHeight;
  }, [completeNarrativeConfig, contentAreaHeight]);

  const maxConstrainedHeightPx = useMemo(() => {
    const { displayLocation } = completeNarrativeConfig;
    if (contentAreaHeight === undefined) {
      return undefined;
    }
    if (displayLocation === 'alone') {
      return contentAreaHeight;
    }
    // Ensure expanded cap is never smaller than collapsed cap (happens when heightFraction > 0.5)
    return Math.max(contentAreaHeight * 0.5, constrainedHeightPx ?? 0);
  }, [completeNarrativeConfig, contentAreaHeight, constrainedHeightPx]);

  const { displayLocation } = completeNarrativeConfig;

  const narrativeNode: ReactNode = narrativeShouldShow ? (
    <WidgetNarrative
      widgetProps={narrativeWidgetProps}
      constrainedHeightPx={constrainedHeightPx}
      maxConstrainedHeightPx={maxConstrainedHeightPx}
    />
  ) : null;

  return {
    contentAreaRef,
    narrativeToggleItem,
    narrativeTopSlot: displayLocation === 'above' ? narrativeNode : null,
    narrativeBottomSlot: displayLocation === 'below' ? narrativeNode : null,
    narrativeAloneContent: displayLocation === 'alone' ? narrativeNode : null,
  };
}
