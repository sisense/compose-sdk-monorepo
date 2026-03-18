import type { PivotTableJSON } from '@/modules/analytics-composer/index-node.js';
import { ChartJSON } from '@/modules/analytics-composer/index-node.js';

/**
 * Sample ECommerce pivot table example
 * Rows: Category, Columns: Gender, Values: Revenue sum
 */
export const SAMPLE_ECOMMERCE_PIVOT_TABLE: PivotTableJSON = {
  dataOptions: {
    rows: ['DM.Category.Category'],
    columns: ['DM.Commerce.Gender'],
    values: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Total Revenue'],
      },
    ],
    grandTotals: { rows: true, columns: true },
  },
  styleOptions: {
    alternatingRowsColor: true,
    alternatingColumnsColor: false,
  },
};

/**
 * Sample ECommerce pivot table with styled dimensions and measures
 */
export const SAMPLE_ECOMMERCE_PIVOT_TABLE_STYLED: PivotTableJSON = {
  dataOptions: {
    rows: [{ column: 'DM.Commerce.Date.Years', sortType: 'sortDesc' }],
    columns: ['DM.Commerce.Gender'],
    values: [
      {
        column: {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Revenue'],
        },
        numberFormatConfig: { name: 'Currency', decimalScale: 2 },
      },
    ],
  },
};

/**
 * Sample ECommerce treemap chart example
 * Shows revenue distribution by category and age range (dataOptions: category, value)
 */
export const SAMPLE_ECOMMERCE_TREEMAP_CHART: ChartJSON = {
  chartType: 'treemap',
  dataOptions: {
    category: ['DM.Category.Category', 'DM.Commerce.Age Range'],
    value: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Revenue'],
      },
    ],
  },
};
