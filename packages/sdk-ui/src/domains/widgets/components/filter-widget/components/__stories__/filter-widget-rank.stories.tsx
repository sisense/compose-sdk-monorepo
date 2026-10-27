import { useEffect, useRef, useState } from 'react';

import {
  createAttribute,
  type Filter,
  filterFactory,
  type Measure,
  measureFactory,
} from '@sisense/sdk-data';
import type { Meta, StoryObj } from '@storybook/react-vite';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { FIELD_HEIGHT, FIELD_RADIUS } from '../design-tokens';
import type { FieldRadius, FieldSize } from '../design-tokens';
import { RankFilter } from '../rank-filter';
import type { RankFilterProps } from '../rank-filter';

/**
 * The Rank filter type, rendered as a spec sheet.
 *
 * Rank keeps the Top or Bottom N of an attribute by a measure the dashboard designer fixed,
 * so the reader picks a direction, a count and — on a date attribute — a level, and never
 * the measure. Every story below hosts the control the way a dashboard does: the filter it
 * publishes comes back in as the value, so Apply, Clear and ✕ can be tried for real.
 *
 * The `Open…` stories click the trigger once on mount, because a screenshot cannot.
 */
const meta: Meta<typeof RankFilter> = {
  title: 'Widgets/FilterWidget/Rank',
  component: RankFilter,
  parameters: { layout: 'padded' },
};
export default meta;

const text = createAttribute({ name: 'Country', expression: '[Commerce.Country]', type: 'text' });
const numeric = createAttribute({
  name: 'Quantity',
  expression: '[Commerce.Quantity]',
  type: 'numeric',
});
const date = DM.Commerce.Date.Years;

const revenue: Measure = measureFactory.sum(DM.Commerce.Revenue);
const distinctCountries: Measure = measureFactory.countDistinct(text);
const longMeasure: Measure = measureFactory.customFormula(
  'Weighted Revenue Per Returning Customer Across All Sales Channels',
  'SUM([rev]) * 2',
  { rev: DM.Commerce.Revenue },
);

type HostProps = Partial<RankFilterProps> & {
  /** Opens the panel once after mount. */
  openOnMount?: boolean;
  /** Tall enough for the open panel, which is drawn over the page rather than in the flow. */
  minHeight?: number;
};

/**
 * Holds the published filter, so the control behaves as it does inside a dashboard.
 * @param props - Control props, plus whether to open the panel and how much room to leave
 * @returns The control in a framed box
 */
const Host = (props: HostProps) => {
  const { openOnMount, minHeight = 80, filter: initial = null, ...rest } = props;
  const [filter, setFilter] = useState<Filter | null>(initial);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openOnMount) return;
    frame.current
      ?.querySelector<HTMLInputElement>('[data-testid="filter-widget-rank-trigger"]')
      ?.click();
  }, [openOnMount]);

  return (
    <div ref={frame} style={{ minHeight, width: 280 }}>
      <RankFilter
        attribute={text}
        rankBy={revenue}
        {...rest}
        filter={filter}
        onFilterUpdate={setFilter}
      />
    </div>
  );
};

type Story = StoryObj<typeof Host>;

/**
 * Lays a specimen beside the token it demonstrates, so a story reads as a spec sheet.
 * @param props - The caption and the control to show against it
 * @returns One labelled row
 */
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
    <code style={{ width: 130, fontSize: 12, color: '#666' }}>{label}</code>
    {children}
  </div>
);

/**
 * No `rankBy`: the trigger is locked and reads `Set filter`. Hovering it, or tabbing to it,
 * says where the designer sets the measure; the panel cannot open.
 */
export const Unset: Story = {
  render: () => <Host rankBy={undefined} />,
};

/** `rankBy` set, nothing applied: the trigger names the measure the ranking will use. */
export const Empty: Story = {
  render: () => <Host />,
};

/** An applied ranking, read back as `Top 5 By <measure>`; the ✕ clears it and keeps the measure. */
export const Filled: Story = {
  render: () => <Host filter={filterFactory.topRanking(text, revenue, 5)} />,
};

/** A measure whose name is long: the trigger truncates it, the panel's Ranked by box wraps it. */
export const LongMeasureName: Story = {
  render: () => (
    <Host
      rankBy={longMeasure}
      filter={filterFactory.bottomRanking(text, longMeasure, 7)}
      openOnMount
      minHeight={360}
    />
  ),
};

/** The panel on a text attribute: direction, count, then the read-only Ranked by box. */
export const OpenText: Story = {
  render: () => <Host rankBy={distinctCountries} openOnMount minHeight={360} />,
};

/** The panel on a numeric attribute — the same anatomy as text. */
export const OpenNumeric: Story = {
  render: () => (
    <Host
      attribute={numeric}
      filter={filterFactory.topRanking(numeric, revenue, 10)}
      openOnMount
      minHeight={360}
    />
  ),
};

/** The panel on a date attribute: the count sits beside a level selector, defaulting to Years. */
export const OpenDate: Story = {
  render: () => (
    <Host
      attribute={date}
      rankBy={measureFactory.countDistinct(date)}
      openOnMount
      minHeight={360}
    />
  ),
};

/** The Size setting. `s` is the default. */
export const Sizes: StoryObj = {
  render: () => (
    <div>
      {(['xs', 's', 'm', 'l', 'xl'] as FieldSize[]).map((size) => (
        <Row key={size} label={`${size} · ${FIELD_HEIGHT[size]}`}>
          <Host size={size} filter={filterFactory.topRanking(text, revenue, 5)} />
        </Row>
      ))}
    </div>
  ),
};

/** The Corner Radius setting, independent of size. */
export const CornerRadii: StoryObj = {
  render: () => (
    <div>
      {(['none', 'xs', 's', 'm', 'l', 'xl'] as FieldRadius[]).map((radius) => (
        <Row key={radius} label={`${radius} · ${FIELD_RADIUS[radius]}`}>
          <Host radius={radius} filter={filterFactory.topRanking(text, revenue, 5)} />
        </Row>
      ))}
    </div>
  ),
};
