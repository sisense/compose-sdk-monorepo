import { createAttribute, createMeasure, filterFactory } from '@sisense/sdk-data';
import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ExecuteQueryParams } from '@/domains/query-execution/types';

import { QueryDefinition } from '../query-definition';

const meta: Meta<typeof QueryDefinition> = {
  title: 'Visualizations/QueryDefinition',
  component: QueryDefinition,
  argTypes: {
    showTooltip: {
      control: 'boolean',
      description: 'Hover pills to see source JSON (works in Storybook without MUI theme).',
    },
    maxPillLength: {
      control: { type: 'number', min: 0 },
      description:
        'Maximum characters shown in each pill label before truncation (default 25). Pass 0 to show the full label.',
    },
  },
  args: {
    showTooltip: true,
    maxPillLength: 25,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Read-only query definition as colored pills (measures → dimensions → filters). ' +
          'Figma-aligned colors; up to 4 pills then “Show N more” / “Show less”. Hover pills for JSON tooltip. ' +
          "Filter pills use readable labels (e.g. `Region is North`, `Category in ['A', 'B']`). " +
          'Long labels truncate at `maxPillLength` (default 25) with an ellipsis; set `maxPillLength={0}` to disable. ' +
          'Tooltips use the viewport by default; pass `tooltipBoundaryElement` (e.g. chart card) to clamp inside a host.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof QueryDefinition>;

const regionAttr = createAttribute({
  name: 'Region',
  type: 'text-attribute',
  expression: '[Geography.Region]',
});
const categoryAttr = createAttribute({
  name: 'Product Category',
  type: 'text-attribute',
  expression: '[Category.Category]',
});
const revenueAttr = createAttribute({
  name: 'Revenue',
  type: 'numeric',
  expression: '[Commerce.Revenue]',
});
const quantityAttr = createAttribute({
  name: 'Quantity',
  type: 'numeric',
  expression: '[Commerce.Quantity]',
});
const sumOfSales = createMeasure({
  name: 'Sum of Sales',
  aggregation: 'sum',
  attribute: revenueAttr,
});
const avgPrice = createMeasure({
  name: 'Avg Price',
  aggregation: 'avg',
  attribute: revenueAttr,
});

export const MeasuresAndDimensions: Story = {
  args: {
    query: {
      measures: [sumOfSales],
      dimensions: [regionAttr],
    } as ExecuteQueryParams,
  },
};

/** Nested AND / OR tree: leaf filter pills, plus a final pill whose tooltip is the full FilterRelations object. */
export const WithFilters: Story = {
  args: {
    query: {
      measures: [sumOfSales],
      dimensions: [regionAttr, categoryAttr],
      filters: filterFactory.logic.and(
        filterFactory.members(regionAttr, ['North', 'South']),
        filterFactory.logic.or(
          filterFactory.members(categoryAttr, ['Electronics']),
          filterFactory.logic.and(
            filterFactory.greaterThan(quantityAttr, 10),
            filterFactory.greaterThan(revenueAttr, 1000),
          ),
        ),
      ),
    } as ExecuteQueryParams,
  },
};

export const ManyPillsShowsMore: Story = {
  args: {
    query: {
      measures: [sumOfSales, avgPrice],
      dimensions: [regionAttr, categoryAttr],
      filters: [
        filterFactory.members(regionAttr, ['North']),
        filterFactory.members(categoryAttr, ['Electronics']),
      ],
    } as ExecuteQueryParams,
  },
  parameters: {
    docs: {
      description: {
        story:
          'More than 4 pills: use “Show N more” to expand; “Show less” to collapse. Hover any pill for source JSON.',
      },
    },
  },
};

export const MeasuresOnly: Story = {
  args: {
    query: {
      measures: [sumOfSales],
    } as ExecuteQueryParams,
  },
};

export const DimensionsOnly: Story = {
  args: {
    query: {
      dimensions: [regionAttr, categoryAttr],
    } as ExecuteQueryParams,
  },
};

export const AllCategories: Story = {
  args: {
    query: {
      measures: [sumOfSales, avgPrice],
      dimensions: [regionAttr],
      filters: [filterFactory.members(regionAttr, ['North'])],
    } as ExecuteQueryParams,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Measure (green), Dimension (purple), Filter (blue) per Figma tokens; connectors "by" and "where".',
      },
    },
  },
};

/** Long filter labels truncate at `maxPillLength` (default 25). Hover for the full label via tooltip or native title. */
export const TruncatedFilterLabels: Story = {
  args: {
    maxPillLength: 25,
    query: {
      filters: [
        filterFactory.members(categoryAttr, ['Calculators', 'Camera Flashes', 'Accessories']),
        filterFactory.members(regionAttr, ['North']),
      ],
    } as ExecuteQueryParams,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multi-value filters produce long readable labels (`Category in […]`). ' +
          'With the default `maxPillLength={25}`, pills show the first 25 characters plus `...`.',
      },
    },
  },
};

export const NoLabelTruncation: Story = {
  args: {
    maxPillLength: 0,
    query: {
      filters: [
        filterFactory.members(categoryAttr, ['Calculators', 'Camera Flashes', 'Accessories']),
      ],
    } as ExecuteQueryParams,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pass `maxPillLength={0}` to render the full pill label without truncation.',
      },
    },
  },
};
