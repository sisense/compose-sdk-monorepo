import { forwardRef, KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';

import { KpiChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { useThemeContext } from '@/infra/contexts/theme-provider/index.js';

import { BodyArea, BodySlot, CardRoot } from './kpi-card-styles.js';
import { KpiSizeTier } from './use-size-tier.js';

/**
 * Defines the props of {@link KpiCard}.
 * @internal
 */
export type KpiCardProps = {
  layout: KpiChartDesignOptions['layout'];
  tier: KpiSizeTier;
  ariaLabel: string;
  card: KpiChartDesignOptions['card'];
  /**
   * Whether `onDataPointClick` or `onDataPointContextMenu` is wired up -- drives the pointer
   * cursor and keyboard focusability, so a context-menu-only card is still reachable by keyboard
   * even though Enter/Space only actuates a click.
   */
  clickable: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;
  title: ReactNode;
  value: ReactNode;
  comparison?: ReactNode;
  sparkline?: ReactNode;
  /**
   * External ref to {@link BodyArea}, so the orchestrator can measure its grid-derived (safe,
   * non-circular) height budget -- see `kpi-chart-renderer.tsx`'s `useElementSize(bodyRef)`.
   */
  bodyRef?: RefObject<HTMLDivElement | null>;
};

/**
 * `value`'s `BodySlot` order per {@link KpiCardProps.layout} -- `'standard'` keeps it first
 * (visually above the comparison); `'comparison-first'` moves it after (the comparison takes over
 * the headline position, value renders small below it). DOM
 * order is intentionally unaffected (`{value}{comparison}` always renders in that source order --
 * only the CSS `order` used here changes), keeping focus/reading order stable across layouts.
 */
function valueOrderFor(layout: KpiChartDesignOptions['layout']): number {
  return layout === 'comparison-first' ? 1 : 0;
}

/** `comparison`'s `BodySlot` order -- inverse of {@link valueOrderFor}. */
function comparisonOrderFor(layout: KpiChartDesignOptions['layout']): number {
  return layout === 'comparison-first' ? 0 : 1;
}

/**
 * The KPI card's layout shell: a `<figure role="figure">` grid container that positions the
 * title/value/comparison/sparkline subcomponents (passed in as already-rendered slots) and owns
 * the card-level accessibility contract -- the composed `aria-label`, and, when clickable,
 * keyboard activation (Enter/Space triggers the same native `click` the mouse handler listens
 * for, via `element.click()`, so both paths share one code path and one correctly-typed
 * `MouseEvent`). Groups `value`/`comparison` into a single {@link BodyArea} (see its TSDoc for
 * why), ordered per `layout` via {@link valueOrderFor}/{@link comparisonOrderFor}.
 * @internal
 */
export const KpiCard = forwardRef<HTMLElement, KpiCardProps>(function KpiCard(
  {
    layout,
    tier,
    ariaLabel,
    card,
    clickable,
    onClick,
    onContextMenu,
    title,
    value,
    comparison,
    sparkline,
    bodyRef,
  },
  ref,
) {
  const { themeSettings } = useThemeContext();

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.currentTarget.click();
  };

  return (
    <CardRoot
      ref={ref}
      role="figure"
      aria-label={ariaLabel}
      data-kpi-tier={tier}
      data-kpi-layout={layout}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onKeyDown={clickable ? handleKeyDown : undefined}
      theme={themeSettings}
      $backgroundColor={card.backgroundColor}
      $textAlign={card.textAlign}
      $showBorder={card.showBorder}
      $cornerRadius={card.cornerRadius}
      $clickable={clickable}
      $hasSparkline={!!sparkline}
    >
      {title}
      <BodyArea ref={bodyRef} data-kpi-area="body">
        <BodySlot $order={valueOrderFor(layout)} $shrink={false}>
          {value}
        </BodySlot>
        {comparison && (
          <BodySlot $order={comparisonOrderFor(layout)} $shrink={true}>
            {comparison}
          </BodySlot>
        )}
      </BodyArea>
      {sparkline}
    </CardRoot>
  );
});
