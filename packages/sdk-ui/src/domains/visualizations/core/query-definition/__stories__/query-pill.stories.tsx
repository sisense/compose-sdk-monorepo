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

const meta: Meta<typeof QueryPill> = {
  title: 'Visualizations/QueryDefinition/QueryPill',
  component: QueryPill,
  args: {
    item: sampleItem,
    showTooltip: true,
  },
  argTypes: {
    showTooltip: {
      control: 'boolean',
      description: 'Hover the pill to see JSON (on by default).',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Single query-definition pill; hover for JSON tooltip when `showTooltip` is true.',
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

export const TooltipDisabled: Story = {
  args: { showTooltip: false },
  parameters: {
    docs: {
      description: { story: 'No tooltip on hover when `showTooltip` is false.' },
    },
  },
};
