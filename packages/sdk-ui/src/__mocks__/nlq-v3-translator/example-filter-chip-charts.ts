import { ChartJSON } from '@/modules/analytics-composer/index-node.js';

const TOTAL_REVENUE = {
  function: 'measureFactory.sum',
  args: ['DM.Commerce.Revenue', 'Total Revenue'],
};

function chipChart(category: string, filters: NonNullable<ChartJSON['filters']>): ChartJSON {
  return {
    chartType: 'column',
    dataOptions: {
      category: [category],
      value: [TOTAL_REVENUE],
      breakBy: [],
    },
    filters,
  };
}

const members = (attribute: string, values: string[]) => ({
  function: 'filterFactory.members',
  args: [attribute, values],
});

export const FILTER_CHIP_ELLIPSIS_CASE = 'Chip: Members & text (ellipsis)';

/**
 * Sample ECommerce chart presets for filter-chip grammar in the NLQ demo.
 */
export const FILTER_CHIP_CHART_CASES: Record<string, ChartJSON> = {
  [FILTER_CHIP_ELLIPSIS_CASE]: chipChart('DM.Commerce.Age Range', [
    members('DM.Country.Country', ['United States']),
    members('DM.Commerce.Age Range', ['0-18', '19-24', '25-34', '35-44', '45-54', '65+']),
    members('DM.Commerce.Date.Months', [
      '2012-01-01T00:00:00',
      '2012-02-01T00:00:00',
      '2012-03-01T00:00:00',
    ]),
    {
      function: 'filterFactory.exclude',
      args: [members('DM.Commerce.Condition', ['Used', 'Refurbished'])],
    },
    { function: 'filterFactory.contains', args: ['DM.Brand.Brand', 'Sony'] },
    { function: 'filterFactory.doesntContain', args: ['DM.Category.Category', 'Accessories'] },
    { function: 'filterFactory.startsWith', args: ['DM.Commerce.Condition', 'Refurb'] },
    { function: 'filterFactory.doesntStartWith', args: ['DM.Country.Country', 'United'] },
    { function: 'filterFactory.endsWith', args: ['DM.Brand.Brand', 'sung'] },
    { function: 'filterFactory.doesntEndWith', args: ['DM.Brand.Brand', 'sung'] },
    { function: 'filterFactory.like', args: ['DM.Brand.Brand', '%sony%'] },
  ]),
  'Chip: Datetime levels': chipChart('DM.Commerce.Date.Months', [
    members('DM.Commerce.Date.Years', ['2012-01-01T00:00:00']),
    members('DM.Commerce.Date.Quarters', ['2012-01-01T00:00:00']),
    members('DM.Commerce.Date.Months', [
      '2012-01-01T00:00:00',
      '2012-02-01T00:00:00',
      '2012-03-01T00:00:00',
    ]),
    members('DM.Commerce.Date.Weeks', ['2012-05-07T00:00:00']),
    members('DM.Commerce.Date.Days', ['2012-05-05T13:45:00']),
    {
      function: 'filterFactory.dateRange',
      args: ['DM.Commerce.Date.Years', '2013-01-01T00:00:00', '2014-01-01T00:00:00'],
    },
    {
      function: 'filterFactory.dateRange',
      args: ['DM.Commerce.Date.Days', '2012-05-05T13:45:00', '2012-05-06T09:30:00'],
    },
    { function: 'filterFactory.dateTo', args: ['DM.Commerce.Date.Days', '2012-01-01T00:00:00'] },
    {
      function: 'filterFactory.dateFrom',
      args: ['DM.Commerce.Date.Months', '2013-01-01T00:00:00'],
    },
    { function: 'filterFactory.dateRelativeTo', args: ['DM.Commerce.Date.Days', 7, 7] },
    { function: 'filterFactory.dateRelativeTo', args: ['DM.Commerce.Date.Months', 0, 6] },
    { function: 'filterFactory.dateRelativeFrom', args: ['DM.Commerce.Date.Months', 0, 3] },
    { function: 'filterFactory.thisYear', args: ['DM.Commerce.Date'] },
    { function: 'filterFactory.thisQuarter', args: ['DM.Commerce.Date'] },
    { function: 'filterFactory.thisMonth', args: ['DM.Commerce.Date'] },
    { function: 'filterFactory.today', args: ['DM.Commerce.Date'] },
  ]),
  'Chip: Mixed grammar': chipChart('DM.Country.Country', [
    { function: 'filterFactory.between', args: ['DM.Commerce.Revenue', 100, 5000] },
    { function: 'filterFactory.greaterThan', args: ['DM.Commerce.Revenue', 0] },
    { function: 'filterFactory.greaterThanOrEqual', args: ['DM.Commerce.Quantity', 10] },
    { function: 'filterFactory.lessThan', args: ['DM.Commerce.Quantity', 100] },
    { function: 'filterFactory.lessThanOrEqual', args: ['DM.Commerce.Cost', 50] },
    { function: 'filterFactory.doesntEqual', args: ['DM.Commerce.Cost', 0] },
    { function: 'filterFactory.equals', args: ['DM.Commerce.Quantity', 1] },
    { function: 'filterFactory.measureGreaterThan', args: [TOTAL_REVENUE, 1000] },
    { function: 'filterFactory.measureLessThan', args: [TOTAL_REVENUE, 1_000_000] },
    { function: 'filterFactory.topRanking', args: ['DM.Country.Country', TOTAL_REVENUE, 10] },
    { function: 'filterFactory.bottomRanking', args: ['DM.Category.Category', TOTAL_REVENUE, 5] },
    {
      function: 'filterFactory.union',
      args: [
        [
          { function: 'filterFactory.contains', args: ['DM.Category.Category', 'Phone'] },
          { function: 'filterFactory.contains', args: ['DM.Category.Category', 'Camera'] },
        ],
      ],
    },
    {
      function: 'filterFactory.intersection',
      args: [
        [
          { function: 'filterFactory.startsWith', args: ['DM.Brand.Brand', 'S'] },
          { function: 'filterFactory.doesntContain', args: ['DM.Brand.Brand', 'Samsung'] },
        ],
      ],
    },
    {
      function: 'filterFactory.cascading',
      args: [[members('DM.Brand.Brand', ['Sony']), members('DM.Category.Category', ['Phones'])]],
    },
  ]),
};
