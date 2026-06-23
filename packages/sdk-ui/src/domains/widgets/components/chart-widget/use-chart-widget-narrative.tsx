/* eslint-disable @typescript-eslint/naming-convention */
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { NarrativeTriggerButton } from '@/domains/narrative/components/narrative-trigger-button';
import { WidgetNarrative } from '@/domains/narrative/components/widget-narrative';
import { getWidgetNarrativeOptionsFromWidgetProps } from '@/domains/narrative/core/get-widget-narrative-from-widget-props.js';
import type { WithCommonWidgetProps } from '@/domains/widgets/components/widget/types';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { getCompleteWidgetNarrativeOptions } from '@/types';
import type { ChartWidgetStyleOptions } from '@/types';

import type { ChartWidgetProps } from './types';

type UseChartWidgetNarrativeParams = {
  propsWithDrilldown: ChartWidgetProps;
  styleOptions: ChartWidgetStyleOptions | undefined;
};

type UseChartWidgetNarrativeReturn = {
  /** Ref to pass to WidgetContainer — measures the content area for height constraints. */
  contentAreaRef: RefObject<HTMLDivElement | null>;
  /** styleOptions extended with the narrative trigger button injected into the header toolbar when applicable. */
  styleOptionsWithNarrative: ChartWidgetStyleOptions | undefined;
  /** Narrative element for the top slot; non-null only when displayLocation is `above` and narrative is visible. */
  narrativeTopSlot: ReactNode;
  /** Narrative element for the bottom slot; non-null only when displayLocation is `below` and narrative is visible. */
  narrativeBottomSlot: ReactNode;
  /** Narrative element used as widget content; non-null only when displayLocation is `alone` and narrative is visible. */
  narrativeAloneContent: ReactNode;
};

/**
 * Encapsulates all narrative-related logic for ChartWidget:
 * options resolution, visibility state, trigger-button toolbar injection, and height constraints.
 *
 * @internal
 */
export function useChartWidgetNarrative({
  propsWithDrilldown,
  styleOptions,
}: UseChartWidgetNarrativeParams): UseChartWidgetNarrativeReturn {
  const { app } = useSisenseContext();

  const completeNarrativeOptions = useMemo(
    () =>
      getCompleteWidgetNarrativeOptions(
        getWidgetNarrativeOptionsFromWidgetProps(propsWithDrilldown),
      ),
    [propsWithDrilldown],
  );

  const canGenerateNarrativeViaAI = app?.settings?.narrative?.canGenerateNarrativeViaAI ?? false;

  const [narrativeVisible, setNarrativeVisible] = useState(false);

  const showNarrativeTrigger =
    canGenerateNarrativeViaAI &&
    completeNarrativeOptions.enabled &&
    !completeNarrativeOptions.autoShow;

  const styleOptionsWithNarrative = useMemo<ChartWidgetStyleOptions | undefined>(() => {
    if (!showNarrativeTrigger) return styleOptions;
    return {
      ...styleOptions,
      header: {
        ...styleOptions?.header,
        renderToolbar: (_onRefresh: () => void, defaultToolbar: JSX.Element) => {
          const toolbar = styleOptions?.header?.renderToolbar
            ? styleOptions.header.renderToolbar(_onRefresh, defaultToolbar)
            : defaultToolbar;
          return (
            <>
              {toolbar}
              <NarrativeTriggerButton
                isVisible={narrativeVisible}
                onClick={() => setNarrativeVisible((v) => !v)}
              />
            </>
          );
        },
      },
    };
  }, [showNarrativeTrigger, styleOptions, narrativeVisible, setNarrativeVisible]);

  const narrativeShouldShow =
    canGenerateNarrativeViaAI &&
    completeNarrativeOptions.enabled &&
    (completeNarrativeOptions.autoShow || narrativeVisible);

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
    const { heightFraction, displayLocation } = completeNarrativeOptions;
    if (
      heightFraction === undefined ||
      displayLocation === 'alone' ||
      contentAreaHeight === undefined
    ) {
      return undefined;
    }
    return heightFraction * contentAreaHeight;
  }, [completeNarrativeOptions, contentAreaHeight]);

  const maxConstrainedHeightPx = useMemo(() => {
    const { displayLocation } = completeNarrativeOptions;
    if (contentAreaHeight === undefined) {
      return undefined;
    }
    if (displayLocation === 'alone') {
      return contentAreaHeight;
    }
    // Ensure expanded cap is never smaller than collapsed cap (happens when heightFraction > 0.5)
    return Math.max(contentAreaHeight * 0.5, constrainedHeightPx ?? 0);
  }, [completeNarrativeOptions, contentAreaHeight, constrainedHeightPx]);

  const { displayLocation } = completeNarrativeOptions;

  const narrativeNode: ReactNode = narrativeShouldShow ? (
    <WidgetNarrative
      widgetProps={narrativeWidgetProps}
      constrainedHeightPx={constrainedHeightPx}
      maxConstrainedHeightPx={maxConstrainedHeightPx}
    />
  ) : null;

  return {
    contentAreaRef,
    styleOptionsWithNarrative,
    narrativeTopSlot: displayLocation === 'above' ? narrativeNode : null,
    narrativeBottomSlot: displayLocation === 'below' ? narrativeNode : null,
    narrativeAloneContent: displayLocation === 'alone' ? narrativeNode : null,
  };
}
