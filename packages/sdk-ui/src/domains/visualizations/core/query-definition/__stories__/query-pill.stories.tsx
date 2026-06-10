import { createAttribute, createMeasure } from '@sisense/sdk-data';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { QueryPill } from '../query-pill';
import type { QueryPillItem } from '../types';

const revenueAttr = createAttribute({
  name: 'Revenue',
  type: 'numeric',
  expression: '[Commerce.Revenue]',
});

const sampleItem: QueryPillItem = {
  type: 'pill',
  label: 'Sum of Sales',
  category: 'measure',
  id: 'm1',
  tooltipData: createMeasure({
    name: 'Sum of Sales',
    aggregation: 'sum',
    attribute: revenueAttr,
  }),
};

const longFilterItem: QueryPillItem = {
  type: 'pill',
  label: "Category in ['Calculators', 'Camera Flashes', 'Accessories']",
  category: 'filter',
  id: 'f1',
};

const meta: Meta<typeof QueryPill> = {
  title: 'Visualizations/QueryDefinition/QueryPill',
  component: QueryPill,
  args: {
    item: sampleItem,
    showTooltip: true,
    maxLength: 0,
  },
  argTypes: {
    showTooltip: {
      control: 'boolean',
      description: 'Hover the pill to see JSON (on by default).',
    },
    maxLength: {
      control: { type: 'number', min: 0 },
      description:
        'Maximum characters shown in the pill label before truncation. Pass 0 to show the full label.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Single query-definition pill; hover for JSON tooltip when `showTooltip` is true. ' +
          'Use `maxLength` to truncate long labels (`QueryDefinition` passes `maxPillLength={25}` by default).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof QueryPill>;

export const Measure: Story = {};

export const Dimension: Story = {
  args: {
    item: {
      type: 'pill',
      label: 'Region',
      category: 'dimension',
      tooltipData: createAttribute({
        name: 'Region',
        type: 'text-attribute',
        expression: '[Geography.Region]',
      }),
    },
  },
};

export const Filter: Story = {
  args: {
    item: longFilterItem,
    maxLength: 0,
  },
};

export const TruncatedLabel: Story = {
  args: {
    item: longFilterItem,
    maxLength: 25,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Labels longer than `maxLength` are cut at that length and suffixed with `...`. ' +
          'The full label is available via the native `title` attribute and tooltip.',
      },
    },
  },
};

export const TooltipDisabled: Story = {
  args: { showTooltip: false },
  parameters: {
    docs: {
      description: { story: 'No tooltip on hover when `showTooltip` is false.' },
    },
  },
};
