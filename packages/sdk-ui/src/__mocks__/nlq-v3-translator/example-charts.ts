import { ChartJSON } from '@/modules/analytics-composer/index-node.js';

/**
 * Sample ECommerce column chart example
 * Shows revenue by months with gender breakdown (dataOptions: category, value, breakBy)
 */
export const SAMPLE_ECOMMERCE_COLUMN_CHART: ChartJSON = {
  chartType: 'column',
  dataOptions: {
    category: ['DM.Commerce.Date.Months'],
    value: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Total Revenue'],
      },
    ],
    breakBy: ['DM.Commerce.Gender'],
  },
  filters: [
    {
      function: 'filterFactory.members',
      args: [
        'DM.Commerce.Date.Months',
        ['2012-01-01T00:00:00', '2012-02-01T00:00:00', '2012-03-01T00:00:00'],
      ],
    },
    {
      function: 'filterFactory.topRanking',
      args: [
        'DM.Brand.Brand',
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Total Revenue'],
        },
        5,
      ],
    },
  ],
  styleOptions: {
    legend: { enabled: true, position: 'bottom' },
  },
};

/**
 * Sample ECommerce column chart example
 * Shows revenue by gender with age range breakdown, filtered to specific age ranges
 */
export const SAMPLE_ECOMMERCE_COLUMN_CHART_BY_AGE: ChartJSON = {
  chartType: 'column',
  dataOptions: {
    category: ['DM.Commerce.Gender'],
    value: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Total Revenue'],
      },
    ],
    breakBy: ['DM.Commerce.Age Range'],
  },
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Commerce.Age Range', ['25-34', '35-44', '45-54', '55-64', '65+']],
    },
  ],
};

/**
 * Sample ECommerce line chart example with styled measure
 * Shows revenue trend over months
 */
export const SAMPLE_ECOMMERCE_LINE_CHART: ChartJSON = {
  chartType: 'line',
  dataOptions: {
    category: [{ column: 'DM.Commerce.Date.Months', dateFormat: 'yy-MM' }],
    value: [
      {
        column: {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Revenue'],
        },
        trend: {
          modelType: 'advancedSmoothing',
        },
        forecast: {
          modelType: 'auto',
          forecastHorizon: 6,
        },
        numberFormatConfig: { name: 'Currency', decimalScale: 2 },
      },
    ],
    breakBy: [],
  },
};

/**
 * Sample ECommerce bar chart example
 * Shows quantity by category (dataOptions: category, value)
 */
export const SAMPLE_ECOMMERCE_BAR_CHART: ChartJSON = {
  chartType: 'bar',
  dataOptions: {
    category: ['DM.Category.Category'],
    value: [
      {
        column: {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Quantity', 'Total Quantity'],
        },
        sortType: 'sortDesc',
      },
    ],
    breakBy: [],
  },
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Commerce.Date.Years', ['2013-01-01T00:00:00']],
    },
  ],
};

/**
 * Sample ECommerce pie chart example
 * Shows revenue distribution by category
 */
export const SAMPLE_ECOMMERCE_PIE_CHART: ChartJSON = {
  chartType: 'pie',
  dataOptions: {
    category: [{ column: 'DM.Category.Category', sortType: 'sortDesc' }],
    value: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Revenue by Category'],
      },
    ],
  },
  styleOptions: {
    legend: { enabled: true, position: 'right' },
  },
};

/**
 * Sample ECommerce area chart example
 * Shows revenue trend by gender
 */
export const SAMPLE_ECOMMERCE_AREA_CHART: ChartJSON = {
  chartType: 'area',
  dataOptions: {
    category: ['DM.Commerce.Date.Months'],
    value: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Revenue'],
      },
    ],
    breakBy: ['DM.Commerce.Gender'],
  },
};

/**
 * Sample ECommerce scatter chart example
 * Shows revenue vs cost with category coloring and quantity sizing (dataOptions: x, y, breakByColor, size)
 */
export const SAMPLE_ECOMMERCE_SCATTER_CHART: ChartJSON = {
  chartType: 'scatter',
  dataOptions: {
    x: {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue', 'Revenue'],
    },
    y: {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Cost', 'Cost'],
    },
    breakByColor: 'DM.Category.Category',
    size: {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Quantity', 'Quantity'],
    },
  },
  styleOptions: {
    legend: { enabled: true },
  },
};

/**
 * Sample ECommerce combo (mixed) chart example
 * Shows revenue as column and cost as line
 */
export const SAMPLE_ECOMMERCE_COMBO_CHART: ChartJSON = {
  chartType: 'line',
  dataOptions: {
    category: ['DM.Commerce.Date.Quarters'],
    value: [
      {
        column: {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Revenue'],
        },
        chartType: 'column',
      },
      {
        column: {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Cost', 'Cost'],
        },
        chartType: 'line',
        showOnRightAxis: true,
      },
    ],
    breakBy: [],
  },
  styleOptions: {
    legend: { enabled: true, position: 'top' },
    yAxis: { title: { text: 'Revenue', enabled: true } },
    y2Axis: { title: { text: 'Cost', enabled: true } },
  },
};

/**
 * Sample ECommerce funnel chart example
 * Shows revenue funnel by age range
 */
export const SAMPLE_ECOMMERCE_FUNNEL_CHART: ChartJSON = {
  chartType: 'funnel',
  dataOptions: {
    category: ['DM.Commerce.Age Range'],
    value: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Revenue'],
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

/**
 * Sample ECommerce polar chart example
 * Shows quantity by age range with gender breakdown
 */
export const SAMPLE_ECOMMERCE_POLAR_CHART: ChartJSON = {
  chartType: 'polar',
  dataOptions: {
    category: ['DM.Commerce.Age Range'],
    value: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Quantity', 'Quantity'],
      },
    ],
    breakBy: ['DM.Commerce.Gender'],
  },
};

/**
 * Sample ECommerce streamgraph chart example
 * Shows revenue trend by category as stacked area
 */
export const SAMPLE_ECOMMERCE_STREAMGRAPH_CHART: ChartJSON = {
  chartType: 'streamgraph',
  dataOptions: {
    category: ['DM.Commerce.Date.Quarters'],
    value: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Revenue'],
      },
    ],
    breakBy: ['DM.Category.Category'],
  },
};

/**
 * Sample ECommerce sunburst chart example
 * Shows revenue hierarchy by category and age range
 */
export const SAMPLE_ECOMMERCE_SUNBURST_CHART: ChartJSON = {
  chartType: 'sunburst',
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

/**
 * Sample ECommerce table chart example
 * Shows category, age range, and revenue columns
 */
export const SAMPLE_ECOMMERCE_TABLE_CHART: ChartJSON = {
  chartType: 'table',
  dataOptions: {
    columns: [
      'DM.Category.Category',
      'DM.Commerce.Age Range',
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Total Revenue'],
      },
    ],
  },
};

/**
 * Sample ECommerce indicator chart example
 * Shows revenue with cost as secondary comparison
 */
export const SAMPLE_ECOMMERCE_INDICATOR_CHART: ChartJSON = {
  chartType: 'indicator',
  dataOptions: {
    value: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Revenue'],
      },
    ],
    secondary: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Cost', 'Cost'],
      },
    ],
  },
};

/**
 * Sample ECommerce boxplot chart example
 * Shows cost distribution by category
 * Note: boxplot value is a column reference (dimension) for distribution analysis
 */
export const SAMPLE_ECOMMERCE_BOXPLOT_CHART: ChartJSON = {
  chartType: 'boxplot',
  dataOptions: {
    category: ['DM.Category.Category'],
    value: ['DM.Commerce.Cost'],
  } as unknown as ChartJSON['dataOptions'],
  styleOptions: { subtype: 'boxplot/iqr' },
};

/**
 * Sample ECommerce areamap chart example
 * Shows revenue by country
 */
export const SAMPLE_ECOMMERCE_AREAMAP_CHART: ChartJSON = {
  chartType: 'areamap',
  dataOptions: {
    geo: ['DM.Country.Country'],
    color: [
      {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Revenue'],
      },
    ],
  },
};

/**
 * Sample ECommerce scattermap chart example
 * Shows revenue by country with category details (dataOptions: geo, colorBy, details)
 */
export const SAMPLE_ECOMMERCE_SCATTERMAP_CHART: ChartJSON = {
  chartType: 'scattermap',
  dataOptions: {
    geo: ['DM.Country.Country'],
    colorBy: {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue', 'Revenue'],
    },
    details: 'DM.Category.Category',
  },
};

/**
 * Sample ECommerce calendar heatmap chart example
 * Shows revenue by date
 */
export const SAMPLE_ECOMMERCE_CALENDAR_HEATMAP_CHART: ChartJSON = {
  chartType: 'calendar-heatmap',
  dataOptions: {
    date: 'DM.Commerce.Date',
    value: {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue', 'Revenue'],
    },
  },
  styleOptions: {
    viewType: 'quarter',
  },
};
