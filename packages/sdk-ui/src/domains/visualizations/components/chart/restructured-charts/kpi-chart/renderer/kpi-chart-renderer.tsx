import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  comparisonMeasureNumberFormatConfig,
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
  AUTO_FIT_LINE_HEIGHT,
  BODY_GAP_PX,
  CARD_BORDER_PX,
  CARD_PADDING_BLOCK_END_PX,
  CARD_PADDING_BLOCK_START_PX,
  CARD_ROW_GAP_PX,
  COMPARISON_LABEL_LINE_PX,
  SPARKLINE_MIN_HEIGHT_PX,
} from './kpi-card-styles.js';
import { KpiCard } from './kpi-card.js';
import { KpiComparison } from './kpi-comparison.js';
import { KpiSparkline } from './kpi-sparkline.js';
import { KpiTitle } from './kpi-title.js';
import { AUTO_FIT_MIN_PX, KpiValue } from './kpi-value.js';
import { resolveOnColor, resolveSparklineColor } from './on-color.js';
import { useElementSize } from './use-element-size.js';
import { getHeightTier, getSizeTier } from './use-size-tier.js';

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
  /**
   * Paint signal for the consumer `onReady` contract (Fusion `domready` / PDF) — the KPI
   * counterpart of the Highcharts `load` / `render` events other renderers forward. See the
   * paint effect in the component below for when it fires.
   */
  onReady?: ChartRendererProps['onReady'];
};

/** Fallback series color used for the sparkline/value when no theme variant color is set. */
const DEFAULT_ACCENT_COLOR = '#7b68ee';

// Estimated (measurement-free) content heights, in px, used only to decide whether the sparkline
// fits -- see the `sparklineHasRoom` computation. Estimates (not DOM measurements) keep the
// decision deterministic and independent of the interdependent ResizeObserver settle order.
/** Approximate title row height when shown (0.72rem uppercase text + baseline). */
const TITLE_ROW_EST_PX = 20;
/** The value's compact-scale font size (matches `COMPACT_FONT_SIZE` in kpi-value.tsx), in px. */
const COMPACT_VALUE_FONT_PX = 14.4;
/** Approximate height of the compact (single-line) comparison readout. */
const COMPACT_COMPARISON_EST_PX = 31;

/**
 * Period-caption date format used when the category data option carries no `dateFormat` of its
 * own. Month precision: the caption names the period the headline covers, and the card has no
 * room for a longer string.
 */
const DEFAULT_PERIOD_DATE_FORMAT = 'MMM yyyy';

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
  dataOptions,
  designOptions,
  onDataPointClick,
  onDataPointContextMenu,
  onBeforeRender,
  onReady,
}) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const dateFormatter = useDateFormatter();
  const containerRef = useRef<HTMLElement>(null);
  // The figure's raw size feeds two things: the coarse size tier, and (on sparkline cards) the
  // headline height budget below -- one observer serves both.
  const figureSize = useElementSize(containerRef);
  const tier = getSizeTier(figureSize.width, figureSize.height);
  // Collapsing the comparison readout onto one line is purely a vertical-room decision: it saves a
  // line when the card is short. It must NOT key off the combined tier, or a narrow-but-tall card
  // (small combined tier due to width) would single-line and clip horizontally instead of stacking
  // the label to its own row -- so it keys off the height tier alone.
  const heightTier = getHeightTier(figureSize.height);

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

  const dataPoint = useMemo(
    () => toKpiDataPoint(finalRenderOptions, dataOptions, chartData.categoryValue),
    [finalRenderOptions, dataOptions, chartData.categoryValue],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      kpiOnDataPointClick?.(dataPoint, event.nativeEvent);
    },
    [kpiOnDataPointClick, dataPoint],
  );
  // Suppresses the browser's native context menu before handing the event on, matching what the
  // Highcharts-based renderers do for their own `contextmenu` point event (see
  // `apply-event-handlers.ts`). Consumers of `onDataPointContextMenu` -- Jump to Dashboard above
  // all -- open their own menu at the pointer position, and without this the native menu opens on
  // top of it. Only reached when a handler is wired up (see the `onContextMenu` prop below), so a
  // card with no context-menu consumer keeps the browser's default behavior.
  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      kpiOnDataPointContextMenu?.(dataPoint, event.nativeEvent);
    },
    [kpiOnDataPointContextMenu, dataPoint],
  );

  // Paint signal feeding the consumer `onReady` prop (Fusion `domready` / PDF). The card has no
  // single Highcharts instance whose `load`/`render` event could stand in for the whole thing, so
  // paint is reported from a passive effect: React runs it after the commit is in the DOM, i.e.
  // once the title, value and comparison are painted. That covers the sparkline too --
  // `HighchartsReact` creates and updates its chart in a LAYOUT effect of a child component, and
  // React flushes every child effect before this parent one, so the sparkline SVG is already
  // drawn (its own animation is off, see `sparkline-options.ts`) whenever this fires.
  //
  // The FIRST commit is deliberately excluded: the card lays itself out from its own measured box
  // (tier, sparkline room -- see the `useElementSize` calls above), and that box is only measured
  // in the layout effects OF that first commit. Signaling there would report a pre-layout card --
  // one whose sparkline hasn't even been decided on, let alone drawn -- to a consumer that
  // snapshots on `onReady`. `hasLaidOut` flips in a mount layout effect declared after those
  // measurements (layout effects run in hook order), so the next commit is the first one rendered
  // from a measured box, and it is the one that signals.
  //
  // Deliberately no dependency array on the signal itself: it fires on every commit from then on,
  // mirroring Highcharts' own per-redraw `render` event, so a later relayout (resize, tier change,
  // sparkline dropped for lack of room) re-signals rather than leaving the consumer with a stale
  // first paint. `useChartOnReady` collapses the repeats into one rising edge per load cycle.
  //
  // Declared above the no-results early return so the terminal empty overlay reports paint as
  // well: the KPI renderer owns both of its empty states, and `hasNoResults` therefore never
  // reports "no results" for KPI on RegularChart's behalf (see `has-no-results.ts`) -- nothing
  // else would fire `onReady` for an empty KPI card.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const [hasLaidOut, setHasLaidOut] = useState(false);
  useLayoutEffect(() => {
    setHasLaidOut(true);
  }, []);
  useEffect(() => {
    if (hasLaidOut) {
      onReadyRef.current?.();
    }
  });

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
  // `title.enabled` switches the whole title section; the show* parts opt their own piece out.
  const showTitleText = designOptions.title.enabled && designOptions.title.showValueTitle;
  // The category column's own `dateFormat` (explicit, or inherited from a formatted level
  // attribute by `normalizeColumn`) governs every place the card displays a category value --
  // the period caption here and the sparkline tooltip below. Each site keeps its own fallback,
  // since they need different precision when the consumer specified nothing.
  const categoryDateFormat = dataOptions.category?.dateFormat;
  const period =
    designOptions.title.enabled &&
    designOptions.title.showCategoryTitle &&
    valuePeriodMs !== undefined &&
    !isNaN(valuePeriodMs)
      ? dateFormatter(new Date(valuePeriodMs), categoryDateFormat ?? DEFAULT_PERIOD_DATE_FORMAT)
      : undefined;

  // The theme accent (first palette color): the value text's DEFAULT color — indicator parity,
  // measure-level color options override, and deliberately no contrast guard (the legacy
  // indicator renders its palette color on any background). The sparkline starts from the same
  // accent but keeps it only while legible against a custom background (WCAG 1.4.11 graphics
  // contrast), then falls back to the better of the theme text color or white.
  const accentColor = themeSettings.palette?.variantColors?.[0] ?? DEFAULT_ACCENT_COLOR;
  const sparklineColor = resolveSparklineColor({
    accent: accentColor,
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
  // Formats the comparison readout with the comparison measure's own config when it carries one
  // ('delta'/'target'), else the headline's — 'value'-type comparisons resolved theirs in the
  // data layer already. Guarded on type match: an `onBeforeRender` consumer can swap the
  // comparison's type entirely (e.g. delta -> target), and the original `dataOptions.comparison`
  // then describes a different measure than the one actually being displayed -- honoring its
  // config in that case would format the readout with the wrong measure's decimals/units. Same
  // principle as `toComparisonDisplay`'s color/numberFormatConfig carryover (helpers.ts).
  const comparisonNumberFormatConfig =
    comparisonDisplay?.type === 'value'
      ? comparisonDisplay.numberFormatConfig
      : comparisonDisplay?.type === dataOptions.comparison?.type
      ? comparisonMeasureNumberFormatConfig(dataOptions.comparison) ?? chartData.numberFormatConfig
      : chartData.numberFormatConfig;

  // The aria summary must voice exactly what the card shows (see `summarizeComparisonForAria`),
  // so it gets the same `designOptions.comparison` text customizations the visible readout
  // renders with: the label override (also fed to `{{goal}}` interpolation) and the target
  // string templates.
  const comparisonSummary = comparisonDisplay
    ? summarizeComparisonForAria(
        designOptions.comparison.label !== undefined
          ? { ...comparisonDisplay, label: designOptions.comparison.label }
          : comparisonDisplay,
        comparisonNumberFormatConfig,
        t,
        designOptions.comparison.display,
        {
          ofGoalText: designOptions.comparison.ofGoalText,
          toGoText: designOptions.comparison.toGoText,
        },
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
  // Collapse the comparison onto a single line only when the card is short (no vertical room for a
  // stacked label). A narrow-but-tall card is NOT compact, so its readout stacks and each line
  // ellipsizes rather than a single row overflowing horizontally.
  const compactComparison = heightTier === 'xs' || heightTier === 'sm';

  // 'comparison-first' swaps which of value/comparison plays the headline (big, auto-fit) role: the
  // comparison takes the headline position/scale, and the value renders small where the
  // comparison sits in 'standard'. Falls
  // back to the value staying headline when there's no comparison to hand the role to at all
  // (e.g. 'comparison-first' picked without a comparison configured) -- otherwise the card would
  // render with no headline element whatsoever.
  const isComparisonFirst = designOptions.layout === 'comparison-first' && !!comparisonDisplay;
  const valueScale = isComparisonFirst ? 'compact' : 'headline';
  const comparisonScale = isComparisonFirst ? 'headline' : 'compact';

  // The "compact" sibling's height, subtracted from the body's height budget to get the
  // headline sibling's real budget -- 0 (no subtraction) when there's no comparison to share
  // the body with at all.
  const compactSiblingHeight = isComparisonFirst ? valueAreaSize.height : comparisonAreaSize.height;
  const gapPx = comparisonDisplay ? BODY_GAP_PX : 0;
  const cardBorderTotalPx = designOptions.card.showBorder ? 2 * CARD_BORDER_PX : 0;

  // Content-aware sparkline visibility: the sparkline is the FIRST element to yield when the card
  // is too short for its fixed content -- so the value keeps its configured (possibly fixed, large)
  // size and is never clipped; we drop the sparkline rather than shrink the value. Computed from
  // the estimated RIGID (non-shrinkable) height of the title + value + comparison, not from DOM
  // measurements: the value at its fixed textSize (auto values shrink, so they use the auto floor);
  // the comparison headline at its min font plus the label it stacks; the compact comparison at its
  // fixed readout height. The sparkline shows only when SPARKLINE_MIN_HEIGHT_PX still fits below.
  const innerHeightPx =
    figureSize.height - cardBorderTotalPx - CARD_PADDING_BLOCK_START_PX - CARD_PADDING_BLOCK_END_PX;
  const titleRowPx = showTitleText || period ? TITLE_ROW_EST_PX : 0;
  const valueFontPx =
    designOptions.value.textSize !== 'auto'
      ? designOptions.value.textSize
      : valueScale === 'headline'
      ? AUTO_FIT_MIN_PX
      : COMPACT_VALUE_FONT_PX;
  const valueRigidPx = valueFontPx * AUTO_FIT_LINE_HEIGHT;
  const comparisonRigidPx = !comparisonDisplay
    ? 0
    : comparisonScale === 'headline'
    ? AUTO_FIT_MIN_PX * AUTO_FIT_LINE_HEIGHT + COMPARISON_LABEL_LINE_PX
    : COMPACT_COMPARISON_EST_PX;
  const bodyRigidPx = valueRigidPx + (comparisonDisplay ? gapPx + comparisonRigidPx : 0);
  const sparklineHasRoom =
    innerHeightPx - titleRowPx - 2 * CARD_ROW_GAP_PX - bodyRigidPx >= SPARKLINE_MIN_HEIGHT_PX;
  const showSparkline =
    tier !== 'xs' &&
    designOptions.sparkline.enabled &&
    !!sparklinePoints?.length &&
    sparklineHasRoom;

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
  const bodyBudgetPx = showSparkline
    ? innerHeightPx - titleSize.height - 2 * CARD_ROW_GAP_PX - SPARKLINE_MIN_HEIGHT_PX
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
          showText={showTitleText}
          period={period}
          onColor={onColor}
          areaRef={titleRef}
        />
      }
      value={
        <KpiValue
          text={displayedValue}
          color={value !== undefined ? valueColor ?? accentColor : undefined}
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
            targetTextOverrides={{
              ofGoalText: designOptions.comparison.ofGoalText,
              toGoText: designOptions.comparison.toGoText,
            }}
            scale={comparisonScale}
            compact={compactComparison}
            textAlign={designOptions.card.textAlign}
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
            color={sparklineColor}
            numberFormatConfig={chartData.numberFormatConfig}
            dateFormat={categoryDateFormat}
            // The measure's own title, not `titleText`: the tooltip's leading label plays the role
            // of a series name, so it names the measure regardless of any card title override.
            valueTitle={valueTitle}
            // The accent, not `sparklineColor`: the latter is adjusted for contrast against the
            // card, and the tooltip doesn't sit on the card -- it has the standard white body.
            tooltipValueColor={accentColor}
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
