import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ChartRendererProps } from '@/domains/visualizations/components/chart/types.js';
import { KpiChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { KpiChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { DesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { useThemeContext } from '@/infra/contexts/theme-provider/index.js';
import { NoResultsOverlay } from '@/shared/components/no-results-overlay/no-results-overlay.js';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter.js';
import type { KpiBeforeRenderHandler, KpiDataPointEventHandler } from '@/types.js';

import { isKpiChartDataOptionsInternal } from '../data-options/index.js';
import { resolveComparisonColor } from '../data/value-colors.js';
import { isKpiChartData, KpiChartData } from '../types.js';
import {
  computeHeadlineMaxHeightPx,
  formatKpiValue,
  metricFor,
  resolveConditionalIcon,
  summarizeComparisonForAria,
  toComparisonDisplay,
  toKpiDataPoint,
  toKpiRenderOptions,
} from './helpers.js';
import {
  BODY_GAP_PX,
  CARD_BORDER_PX,
  CARD_PADDING_BLOCK_END_PX,
  CARD_PADDING_BLOCK_START_PX,
  CARD_ROW_GAP_PX,
  SPARKLINE_MIN_HEIGHT_PX,
} from './kpi-card-styles.js';
import { KpiCard } from './kpi-card.js';
import { KpiComparison } from './kpi-comparison.js';
import { KpiSparkline } from './kpi-sparkline.js';
import { KpiTitle } from './kpi-title.js';
import { KpiValue } from './kpi-value.js';
import { resolveOnColor, resolveSparklineColor } from './on-color.js';
import { useElementSize } from './use-element-size.js';
import { getSizeTier } from './use-size-tier.js';

/**
 * Props accepted by the KPI chart renderer.
 *
 * NOTE: the event-handler fields are intentionally typed as the generic
 * `ChartRendererProps` handler unions (rather than the narrower
 * `KpiDataPointEventHandler` / `KpiBeforeRenderHandler` from `@/types.js`).
 * `ChartProps`/`ChartEventProps` in `src/props.tsx` do carry KPI variants
 * (added as part of the public KPI surface), but they're only one member of
 * a larger union of per-chart-type handler signatures with incompatible
 * point-argument shapes (e.g. `DataPoint`, `ScatterDataPoint`,
 * `IndicatorDataPoint`, ...). Narrowing `KpiChartRendererProps` to the KPI
 * handler types directly would make it unassignable to `ChartRendererProps`,
 * which breaks the `isCorrectRendererProps` type predicate used by
 * `ChartBuilder<'kpi'>`, so this component narrows internally instead (see
 * the cast below).
 * @internal
 */
export type KpiChartRendererProps = {
  chartData: KpiChartData;
  dataOptions: KpiChartDataOptionsInternal;
  designOptions: KpiChartDesignOptions;
  onDataPointClick?: ChartRendererProps['onDataPointClick'];
  onDataPointContextMenu?: ChartRendererProps['onDataPointContextMenu'];
  onBeforeRender?: ChartRendererProps['onBeforeRender'];
};

/** Fallback series color used for the sparkline/value when no theme variant color is set. */
const DEFAULT_ACCENT_COLOR = '#7b68ee';

/**
 * KPI chart renderer.
 *
 * Composes the card shell ({@link KpiCard}) with its four subcomponents ({@link KpiTitle},
 * {@link KpiValue}, {@link KpiComparison}, {@link KpiSparkline}), and owns everything that
 * doesn't belong to a single subcomponent: the `onBeforeRender` pipeline, the no-data/no-results
 * branch, size-tier-driven degradation, and the click/context-menu handlers.
 * @internal
 */
export const KpiChartRenderer: React.FC<KpiChartRendererProps> = ({
  chartData,
  designOptions,
  onDataPointClick,
  onDataPointContextMenu,
  onBeforeRender,
}) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const dateFormatter = useDateFormatter();
  const containerRef = useRef<HTMLElement>(null);
  // The figure's raw size feeds two things: the coarse size tier, and (on sparkline cards) the
  // headline height budget below -- one observer serves both.
  const figureSize = useElementSize(containerRef);
  const tier = getSizeTier(figureSize.width, figureSize.height);

  // Non-circular height budget inputs for whichever of value/comparison plays the "headline"
  // (auto-fit) role -- see `headlineMaxHeightPx` below and `use-auto-fit-font-size.ts`'s
  // `maxHeightPxOverride` TSDoc for why the headline element must never self-measure its height.
  // `bodyRef` measures `BodyArea`'s box (safe on sparkline-less cards, where it's the grid's
  // `1fr` row -- sized by grid arithmetic, not by content); `titleRef` measures the fixed-size
  // title row; `valueAreaRef`/`comparisonAreaRef` measure the two body children so whichever one
  // is "compact" (fixed-size) can be subtracted from the budget.
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const valueAreaRef = useRef<HTMLDivElement>(null);
  const comparisonAreaRef = useRef<HTMLDivElement>(null);
  const bodySize = useElementSize(bodyRef);
  const titleSize = useElementSize(titleRef);
  const valueAreaSize = useElementSize(valueAreaRef);
  const comparisonAreaSize = useElementSize(comparisonAreaRef);

  // `onDataPointClick`/`onDataPointContextMenu`/`onBeforeRender` arrive typed as the generic
  // `ChartRendererProps` handler unions (see `KpiChartRendererProps` above). Even though
  // `ChartProps`/`ChartEventProps` in `src/props.tsx` now carry Kpi-specific handler variants,
  // those unions also carry every other chart type's handler variant, and TS can't call a union
  // of functions with incompatible parameter shapes (`DataPoint`, `ScatterDataPoint`, etc.)
  // without narrowing first. `kpiChartBuilder` only ever wires this component up behind
  // `isKpiChartRendererProps` (below), so whatever handler comes through is always functionally
  // a `KpiDataPointEventHandler`/`KpiBeforeRenderHandler`; narrow it here via a documented cast
  // so the rest of this component works with the correctly typed callback.
  const kpiOnDataPointClick = onDataPointClick as unknown as KpiDataPointEventHandler | undefined;
  const kpiOnDataPointContextMenu = onDataPointContextMenu as unknown as
    | KpiDataPointEventHandler
    | undefined;
  const kpiOnBeforeRender = onBeforeRender as unknown as KpiBeforeRenderHandler | undefined;

  // Always translates `labelKey` -> `label` (adaptation 4) and, when set, runs `onBeforeRender`
  // over the resulting public `KpiRenderOptions` -- regardless of whether a consumer supplied
  // one, so the label is resolved exactly once and the merge below always has a
  // `KpiComparisonInfo` to work from.
  const finalRenderOptions = useMemo(() => {
    const renderOptions = toKpiRenderOptions(chartData, t);
    return kpiOnBeforeRender ? kpiOnBeforeRender(renderOptions) : renderOptions;
  }, [chartData, kpiOnBeforeRender, t]);

  const comparisonDisplay = useMemo(
    () =>
      finalRenderOptions.comparison
        ? toComparisonDisplay(chartData.comparison, finalRenderOptions.comparison)
        : undefined,
    [chartData.comparison, finalRenderOptions.comparison],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      kpiOnDataPointClick?.(toKpiDataPoint(finalRenderOptions), event.nativeEvent);
    },
    [kpiOnDataPointClick, finalRenderOptions],
  );
  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      kpiOnDataPointContextMenu?.(toKpiDataPoint(finalRenderOptions), event.nativeEvent);
    },
    [kpiOnDataPointContextMenu, finalRenderOptions],
  );

  const { value, valueTitle, valueColor, valuePeriodMs, sparklinePoints } = finalRenderOptions;
  const noDataText = designOptions.value.noDataText;
  const isEmpty = !chartData.hasRows || value === undefined;

  if (isEmpty && !noDataText) {
    return <NoResultsOverlay iconType="kpi" />;
  }

  const onColor = resolveOnColor(designOptions.card.backgroundColor);
  const displayedValue =
    value !== undefined ? formatKpiValue(value, chartData.numberFormatConfig) : noDataText ?? '';
  const conditionalIcon = resolveConditionalIcon(designOptions.value.conditionalIcons, value);
  const titleText = designOptions.title.text ?? valueTitle;
  const period =
    valuePeriodMs !== undefined && !isNaN(valuePeriodMs)
      ? dateFormatter(new Date(valuePeriodMs), 'MMM yyyy')
      : undefined;

  // Unlike the text (binary dark/white via `onColor`), the sparkline keeps the theme accent as
  // long as it is legible against a custom background (WCAG 1.4.11 graphics contrast), and only
  // then falls back to the better of the theme text color or white.
  const primaryColor = resolveSparklineColor({
    accent: themeSettings.palette?.variantColors?.[0] ?? DEFAULT_ACCENT_COLOR,
    textColor: themeSettings.chart?.textColor ?? '#5b6372',
    backgroundColor: designOptions.card.backgroundColor,
  });

  const comparisonColor = comparisonDisplay
    ? comparisonDisplay.type === 'value'
      ? comparisonDisplay.color
      : resolveComparisonColor(designOptions.comparison.color, metricFor(comparisonDisplay))
    : undefined;
  // Comparison icon conditions evaluate against the same metric the color conditions do
  // (`deltaPercent` / `percentOfTarget` via `metricFor`) -- one condition mechanism, per the
  // design spec. Not applicable to `'value'`-type comparisons, same as the color rule.
  const comparisonConditionalIcon =
    comparisonDisplay && comparisonDisplay.type !== 'value'
      ? resolveConditionalIcon(
          designOptions.comparison.conditionalIcons,
          metricFor(comparisonDisplay),
        )
      : undefined;
  const comparisonNumberFormatConfig =
    comparisonDisplay?.type === 'value'
      ? comparisonDisplay.numberFormatConfig
      : chartData.numberFormatConfig;

  const comparisonSummary = comparisonDisplay
    ? summarizeComparisonForAria(
        comparisonDisplay,
        comparisonNumberFormatConfig,
        designOptions.comparison.display,
      )
    : undefined;
  const ariaLabel = comparisonSummary
    ? `${titleText}, ${displayedValue}, ${comparisonSummary}`
    : `${titleText}, ${displayedValue}`;

  // Either handler makes the card an interactive target: a click-only card needs the pointer
  // cursor and Enter/Space activation, while a context-menu-only card still needs to be reachable
  // by keyboard (Tab focus + the OS/browser's own context-menu key) even though Enter/Space has
  // nothing to actuate there.
  const clickable = !!kpiOnDataPointClick || !!kpiOnDataPointContextMenu;
  // 'xs' has no room for the sparkline (adaptation 2); 'sm' and below collapse the comparison
  // readout onto a single line rather than two stacked lines.
  const showSparkline =
    tier !== 'xs' && designOptions.sparkline.enabled && !!sparklinePoints?.length;
  const compactComparison = tier === 'xs' || tier === 'sm';

  // 'big-comparison' swaps which of value/comparison plays the headline (big, auto-fit) role: the
  // comparison takes the headline position/scale, and the value renders small where the
  // comparison sits in 'standard'. Falls
  // back to the value staying headline when there's no comparison to hand the role to at all
  // (e.g. 'big-comparison' picked without a comparison configured) -- otherwise the card would
  // render with no headline element whatsoever.
  const isBigComparison = designOptions.layout === 'big-comparison' && !!comparisonDisplay;
  const valueScale = isBigComparison ? 'compact' : 'headline';
  const comparisonScale = isBigComparison ? 'headline' : 'compact';

  // The "compact" sibling's height, subtracted from the body's height budget to get the
  // headline sibling's real budget -- 0 (no subtraction) when there's no comparison to share
  // the body with at all.
  const compactSiblingHeight = isBigComparison ? valueAreaSize.height : comparisonAreaSize.height;
  const gapPx = comparisonDisplay ? BODY_GAP_PX : 0;
  // The body's own height budget, per which grid row currently flexes (see GRID_TEMPLATE in
  // kpi-card-styles.ts):
  // - without a sparkline, the body row is `1fr`, so `BodyArea`'s measured box IS the budget
  //   (grid-derived, safe to use);
  // - with one, the SPARKLINE row is the flexible one (it absorbs all leftover height by design)
  //   and `BodyArea` is content-sized, i.e. circular to measure. Derive the budget from grid
  //   arithmetic instead: the figure's inner height minus
  //   the card borders (getBoundingClientRect measures border-inclusive), the title row, both
  //   row gaps, and the sparkline row at its minimum -- everything the body may grow into
  //   while the sparkline stays at least SPARKLINE_MIN_HEIGHT_PX tall.
  const cardBorderTotalPx = designOptions.card.showBorder ? 2 * CARD_BORDER_PX : 0;
  const bodyBudgetPx = showSparkline
    ? figureSize.height -
      cardBorderTotalPx -
      CARD_PADDING_BLOCK_START_PX -
      CARD_PADDING_BLOCK_END_PX -
      titleSize.height -
      2 * CARD_ROW_GAP_PX -
      SPARKLINE_MIN_HEIGHT_PX
    : bodySize.height;
  const headlineMaxHeightPx = computeHeadlineMaxHeightPx(bodyBudgetPx, compactSiblingHeight, gapPx);

  return (
    <KpiCard
      ref={containerRef}
      bodyRef={bodyRef}
      layout={designOptions.layout}
      tier={tier}
      ariaLabel={ariaLabel}
      card={designOptions.card}
      clickable={clickable}
      onClick={clickable ? handleClick : undefined}
      onContextMenu={kpiOnDataPointContextMenu ? handleContextMenu : undefined}
      title={
        <KpiTitle
          title={titleText}
          enabled={designOptions.title.enabled}
          period={period}
          onColor={onColor}
          areaRef={titleRef}
        />
      }
      value={
        <KpiValue
          text={displayedValue}
          color={valueColor}
          textSize={designOptions.value.textSize}
          icon={conditionalIcon}
          onColor={onColor}
          scale={valueScale}
          maxHeightPx={valueScale === 'headline' ? headlineMaxHeightPx : undefined}
          areaRef={valueAreaRef}
        />
      }
      comparison={
        comparisonDisplay && (
          <KpiComparison
            comparison={comparisonDisplay}
            color={comparisonColor}
            numberFormatConfig={comparisonNumberFormatConfig}
            display={designOptions.comparison.display}
            showIcon={designOptions.comparison.showIcon}
            conditionalIcon={comparisonConditionalIcon}
            labelOverride={designOptions.comparison.label}
            scale={comparisonScale}
            compact={compactComparison}
            onColor={onColor}
            maxHeightPx={comparisonScale === 'headline' ? headlineMaxHeightPx : undefined}
            areaRef={comparisonAreaRef}
          />
        )
      }
      sparkline={
        showSparkline && sparklinePoints ? (
          <KpiSparkline
            points={sparklinePoints}
            chartType={designOptions.sparkline.chartType}
            color={primaryColor}
            numberFormatConfig={chartData.numberFormatConfig}
          />
        ) : undefined
      }
    />
  );
};

/** Distinguishes {@link KpiChartDesignOptions} from other chart design options by its `sparkline` shape. */
function isKpiChartDesignOptions(
  designOptions: DesignOptions,
): designOptions is KpiChartDesignOptions {
  return (
    'sparkline' in designOptions &&
    typeof designOptions.sparkline === 'object' &&
    designOptions.sparkline !== null &&
    'chartType' in designOptions.sparkline
  );
}

/**
 * Checks whether the given generic chart renderer props are shaped as
 * {@link KpiChartRendererProps}, narrowing on `chartData`, `dataOptions`, and `designOptions`.
 * @internal
 */
export const isKpiChartRendererProps = (
  props: ChartRendererProps,
): props is KpiChartRendererProps =>
  !!props.chartData &&
  isKpiChartData(props.chartData) &&
  isKpiChartDataOptionsInternal(props.dataOptions) &&
  isKpiChartDesignOptions(props.designOptions);
