import styled from '@emotion/styled';

import { KpiChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { Themable } from '@/infra/contexts/theme-provider/types.js';

type CardLayout = KpiChartDesignOptions['layout'];

/**
 * Gap between {@link BodyArea}'s two children (value/comparison), in px. Exported so
 * `kpi-chart-renderer.tsx` can subtract the exact same amount when computing the headline auto-fit
 * height budget (`bodyHeight - compactSiblingHeight - BODY_GAP_PX`) -- the two must stay in sync,
 * since a smaller JS-side allowance than the real CSS gap would under-budget (safe, just
 * conservative) while a larger one would over-budget (risking the exact clipping this fixes).
 * @internal
 */
export const BODY_GAP_PX = 4;

// Layout constants shared between the CSS below and the renderer's JS-side height-budget
// arithmetic (see kpi-chart-renderer.tsx). Every value is interpolated into exactly one CSS rule
// in this file, so the two sides cannot drift.
/** Card block padding: start (top) and end (bottom), in px. @internal */
export const CARD_PADDING_BLOCK_START_PX = 14;
/** @internal */
export const CARD_PADDING_BLOCK_END_PX = 8;
/** Gap between the card's grid rows (title/body/sparkline), in px. @internal */
export const CARD_ROW_GAP_PX = 4;
/**
 * The card's border width when `card.showBorder` is on, in px. `useElementSize` measures via
 * `getBoundingClientRect` (border-inclusive), so the renderer must subtract this from both
 * block edges of the figure-derived height budget whenever the border is shown.
 * @internal
 */
export const CARD_BORDER_PX = 1;
/**
 * The sparkline row's minimum height, in px. With a sparkline present the row is
 * `minmax(this, 1fr)` -- it absorbs all leftover height below the content group on tall cards,
 * by design, but never shrinks below this floor.
 * @internal
 */
export const SPARKLINE_MIN_HEIGHT_PX = 32;

// Affix metrics: em-scales and fixed gaps of the inline decorations that share a nowrap box
// with auto-fitted text. The auto-fit hook must budget these (they consume width the text can't
// use), so they're exported for the components to pass as `AutoFitAffix`es and interpolated into
// the CSS rules below from the same constant.
/** `ConditionalIconSpan`'s font size relative to its parent text. @internal */
export const CONDITIONAL_ICON_EM = 0.7;
/** `ConditionalIconSpan`'s margin-inline-end, in px. @internal */
export const CONDITIONAL_ICON_GAP_PX = 6;
/** `ComparisonArrow`'s font size relative to the comparison primary text. @internal */
export const COMPARISON_ARROW_EM = 0.85;
/** `ComparisonPrimaryText`'s flex gap between its items, in px. @internal */
export const COMPARISON_PRIMARY_GAP_PX = 3;
/**
 * Approximate rendered height of the comparison's secondary/label line (`ComparisonSecondaryText`,
 * 0.7rem at ~1.2 line-height), in px. Used by the renderer's sparkline-fit arithmetic to reserve
 * room for the label the headline comparison stacks below itself.
 * @internal
 */
export const COMPARISON_LABEL_LINE_PX = 14;
/** Line-height multiplier the auto-fit corridor assumes; mirrors `use-auto-fit-font-size.ts`. @internal */
export const AUTO_FIT_LINE_HEIGHT = 1.2;

/**
 * The card's grid, identical for every {@link CardLayout}: a `title` row, a `body` row, and a
 * `sparkline` row. `body` is a single grid area (see {@link BodyArea}) that groups the headline
 * value and the comparison readout into one tight vertical block -- which of the two reads at
 * "headline" scale (and which at compact scale) is a `BodySlot` `$order`/prop concern, not a
 * grid-template concern.
 *
 * Which row flexes depends on whether a sparkline is rendered:
 * - with a sparkline, the SPARKLINE row absorbs all leftover height (min
 *   {@link SPARKLINE_MIN_HEIGHT_PX}) while the content group keeps its natural height at the top;
 * - without one, the BODY row flexes and the leftover reads as empty space below the content
 *   group (the original behavior, kept for sparkline-less cards).
 */
const GRID_TEMPLATE = {
  columns: '1fr',
  rowsWithSparkline: `auto auto minmax(${SPARKLINE_MIN_HEIGHT_PX}px, 1fr)`,
  rowsWithoutSparkline: 'auto 1fr auto',
  areas: `'title' 'body' 'sparkline'`,
};

/** The KPI card's root figure element: the grid container laid out by {@link GRID_TEMPLATE}. @internal */
export const CardRoot = styled.figure<
  Themable & {
    $backgroundColor?: string;
    $textAlign: 'left' | 'center' | 'right';
    $showBorder: boolean;
    $cornerRadius: number;
    $clickable: boolean;
    $hasSparkline: boolean;
  }
>`
  margin: 0;
  display: grid;
  grid-template-columns: ${GRID_TEMPLATE.columns};
  grid-template-rows: ${({ $hasSparkline }) =>
    $hasSparkline ? GRID_TEMPLATE.rowsWithSparkline : GRID_TEMPLATE.rowsWithoutSparkline};
  grid-template-areas: ${GRID_TEMPLATE.areas};
  row-gap: ${CARD_ROW_GAP_PX}px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding-block: ${CARD_PADDING_BLOCK_START_PX}px ${CARD_PADDING_BLOCK_END_PX}px;
  padding-inline: 16px;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background-color: ${({ $backgroundColor, theme }) =>
    $backgroundColor ?? theme.chart.backgroundColor};
  /* Logical values only ('start'/'end', never 'left'/'right') -- the card is a hard RTL-safety
     invariant, so 'right' must mirror to the block-end edge (not the physical right) in RTL. */
  text-align: ${({ $textAlign }) =>
    $textAlign === 'left' ? 'start' : $textAlign === 'right' ? 'end' : 'center'};
  border: ${({ $showBorder }) =>
    $showBorder ? `${CARD_BORDER_PX}px solid rgba(0, 0, 0, 0.12)` : 'none'};
  border-radius: ${({ $cornerRadius }) => $cornerRadius}px;
  overflow: hidden;

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }
`;

/** The card's title row: the title text and, when present, the current-period caption. @internal */
export const TitleArea = styled.div`
  grid-area: title;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;

/**
 * Groups the headline value and the comparison readout into one tight vertical block, occupying
 * the grid's flexible `body` row. Its two {@link BodySlot} children are `flex: 0 0 auto` (natural
 * size, packed at the top with no gap-induced growth between them), so any leftover height in the
 * (grid-determined, non-content-based) `body` row trails *after* the last child -- i.e. below the
 * value/comparison pair, immediately before the sparkline -- rather than appearing as dead space
 * between the title/value/comparison trio.
 * @internal
 */
export const BodyArea = styled.div`
  grid-area: body;
  display: flex;
  flex-direction: column;
  gap: ${BODY_GAP_PX}px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;

/**
 * Wraps one of `BodyArea`'s two children, ordering it per {@link CardLayout} (see `kpi-card.tsx`).
 *
 * `$shrink` is the value-protection guarantee: the value slot is rigid (`flex: 0 0 auto`) while the
 * comparison slot may shrink (`flex: 0 1 auto; min-height: 0`). So when the body can't fit both --
 * whatever the cause (a large fixed value textSize, an off-by-a-few-px auto-fit budget, a lagging
 * resize measurement) -- the overflow is absorbed by the comparison (which also auto-fits its font
 * and clips inside its own `overflow: hidden` area) and the VALUE is never clipped. This holds in
 * both layouts: the value is rigid whether it's the headline (standard) or the compact reading
 * (comparison-first).
 * @internal
 */
export const BodySlot = styled.div<{ $order: number; $shrink: boolean }>`
  flex: ${({ $shrink }) => ($shrink ? '0 1 auto' : '0 0 auto')};
  min-width: 0;
  min-height: ${({ $shrink }) => ($shrink ? '0' : 'auto')};
  order: ${({ $order }) => $order};
`;

/** Wraps `KpiValue`'s rendered output inside {@link BodyArea}. @internal */
export const ValueArea = styled.div`
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;

/** Wraps `KpiComparison`'s rendered output inside {@link BodyArea}. @internal */
export const ComparisonArea = styled.div`
  min-width: 0;
  /* Clip the readout to the area so its lines ellipsize (via the inner clip spans) instead of
     spilling and being hard-cut by an ancestor mid-glyph. */
  overflow: hidden;
`;

/**
 * The card's sparkline row. Hidden from assistive tech by its consumer (`kpi-sparkline.tsx`);
 * this element itself only owns the grid-area layout.
 * @internal
 */
export const SparklineArea = styled.div`
  grid-area: sparkline;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  /* No own height: the grid row is minmax(SPARKLINE_MIN_HEIGHT_PX, 1fr) when a sparkline is
     rendered, so the area stretches to however much leftover height the content group leaves --
     the Highcharts instance follows via useElementSize -> explicit chart.width/height. */
  line-height: 0;
`;

/** The card's title text, uppercased. @internal */
export const TitleText = styled.span<Themable & { $onColor: boolean }>`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ $onColor, theme }) => ($onColor ? '#ffffff' : theme.chart.textColor)};
  opacity: ${({ $onColor }) => ($onColor ? 0.85 : 0.55)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** The current-period caption shown next to the title (e.g. `'Jun 2026'`). @internal */
export const PeriodText = styled.span<Themable & { $onColor: boolean }>`
  font-size: 0.7rem;
  color: ${({ $onColor, theme }) => ($onColor ? '#ffffff' : theme.chart.textColor)};
  opacity: ${({ $onColor }) => ($onColor ? 0.75 : 0.45)};
  white-space: nowrap;
  margin-inline-start: 8px;
  flex-shrink: 0;
`;

/** The card's headline value text. @internal */
export const ValueText = styled.div<Themable & { $onColor: boolean; $color?: string }>`
  font-weight: 700;
  line-height: 1.1;
  color: ${({ $color, $onColor, theme }) =>
    $color ?? ($onColor ? '#ffffff' : theme.chart.textColor)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** Condition-driven icon rendered next to the headline value or the comparison readout. @internal */
export const ConditionalIconSpan = styled.span<{ $color?: string }>`
  margin-inline-end: ${CONDITIONAL_ICON_GAP_PX}px;
  font-size: ${CONDITIONAL_ICON_EM}em;
  color: ${({ $color }) => $color ?? 'inherit'};
`;

/**
 * Square SVG box for `built-in` / `svg-path` conditional icons: inherits
 * {@link ConditionalIconSpan}'s margin/em-size/color contract and normalizes the inner svg --
 * a 1em square (of the span's em-scaled font) filled with `currentColor`, nudged slightly
 * below the baseline so a full-bleed square optically matches neighboring text glyphs.
 * `flex-shrink: 0` keeps that square square: the span is a flex item of the value/comparison
 * rows, so a narrow row would otherwise squash its width while `height` stays at 1em -- and the
 * auto-fit budget already reserves the full {@link CONDITIONAL_ICON_EM} box for it either way.
 * @internal
 */
export const ConditionalIconSvgSpan = styled(ConditionalIconSpan)`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  vertical-align: -0.09em;

  & > svg {
    display: block;
    width: 1em;
    height: 1em;
    fill: currentColor;
  }
`;

/**
 * Maps the card's `textAlign` to a writing-mode-relative flex alignment keyword, matching
 * `CardRoot`'s logical `text-align` mapping (`left`->start, `right`->end) so the comparison
 * readout mirrors correctly in RTL rather than pinning to a physical edge.
 * @internal
 */
export type CardTextAlign = 'left' | 'center' | 'right';
const FLEX_ALIGN: Record<CardTextAlign, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

/**
 * The comparison readout's root: row layout when `compact`, column layout otherwise. Honors the
 * card's `textAlign` on its cross axis (column: `align-items`) or main axis (compact row:
 * `justify-content`) so the readout aligns with the value/title. @internal
 */
export const ComparisonRoot = styled.div<{ $compact: boolean; $align: CardTextAlign }>`
  display: flex;
  flex-direction: ${({ $compact }) => ($compact ? 'row' : 'column')};
  align-items: ${({ $compact, $align }) => ($compact ? 'baseline' : FLEX_ALIGN[$align])};
  justify-content: ${({ $compact, $align }) => ($compact ? FLEX_ALIGN[$align] : 'flex-start')};
  gap: ${({ $compact }) => ($compact ? '6px' : '0')};
  min-width: 0;
`;

/** The comparison readout's primary line (e.g. the delta/percent-of-goal text). @internal */
export const ComparisonPrimaryText = styled.div<
  Themable & { $color?: string; $scale: 'compact' | 'headline' }
>`
  /* 'headline' scale's font-size is auto-fit and set inline (see kpi-comparison.tsx), matching
     how ValueText's headline scale is applied -- this rule only ever fires for 'compact'. */
  font-size: ${({ $scale }) => ($scale === 'compact' ? '0.9rem' : undefined)};
  font-weight: 600;
  color: ${({ $color, theme }) => $color ?? theme.chart.textColor};
  display: flex;
  align-items: center;
  gap: ${COMPARISON_PRIMARY_GAP_PX}px;
  white-space: nowrap;
  /* Allow the row (and its clip-text child) to shrink below content width so the inner
     ClipText can ellipsize instead of overflowing. */
  min-width: 0;
  max-width: 100%;
`;

/**
 * The truncating text run inside {@link ComparisonPrimaryText}. Kept separate from the flex row
 * (which also holds the arrow/icon affixes) because `text-overflow: ellipsis` only applies to a
 * block/inline-block box, never to a bare text node inside a flex container. @internal
 */
export const ComparisonClipText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** The comparison readout's secondary line (e.g. the target label or amount-to-go text). @internal */
export const ComparisonSecondaryText = styled.div<Themable & { $onColor: boolean }>`
  font-size: 0.7rem;
  color: ${({ $onColor, theme }) => ($onColor ? '#ffffff' : theme.chart.textColor)};
  opacity: ${({ $onColor }) => ($onColor ? 0.8 : 0.5)};
  white-space: nowrap;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** The up/down arrow glyph shown next to a delta-shaped comparison's primary text. @internal */
export const ComparisonArrow = styled.span`
  font-size: ${COMPARISON_ARROW_EM}em;
`;
