import { QueryJSON } from '@/modules/analytics-composer/index-node.js';

export const SAMPLE_ECOMMERCE_SIMPLE_QUERY: QueryJSON = {
  dimensions: ['DM.Commerce.Date.Years', 'DM.Commerce.Age Range'],
  measures: [
    {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue', 'Total Revenue'],
    },
    {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Cost', 'Total Cost'],
    },
  ],
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Commerce.Date.Years', ['2012-01-01T00:00:00']],
    },
  ],
};

export const SAMPLE_ECOMMERCE_MEASURED_VALUE_REVENUE_BY_GENDER_QUERY: QueryJSON = {
  dimensions: [],
  measures: [
    {
      function: 'measureFactory.measuredValue',
      args: [
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Revenue (Female and Male)'],
        },
        [
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Gender', ['Female', 'Male']],
          },
        ],
        'Revenue (Female and Male)',
      ],
    },
  ],
  filters: [],
};

export const SAMPLE_ECOMMERCE_COMPLEX_QUERY: QueryJSON = {
  dimensions: ['DM.Commerce.Date.Years', 'DM.Brand.Brand', 'DM.Commerce.Age Range'],
  measures: [
    {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue', 'Total Revenue'],
    },
    {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Cost', 'Total Cost'],
    },
    {
      function: 'measureFactory.pastDay',
      args: [
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Cost', 'Total Cost'],
        },
        'Total Cost Previous Day',
      ],
    },
    {
      function: 'measureFactory.rank',
      args: [
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Cost', 'Total Cost'],
        },
        'Cost Rank',
        'DESC',
        '1234',
        ['DM.Brand.Brand'],
      ],
    },
    {
      function: 'measureFactory.customFormula',
      args: [
        'Profitability Ratio',
        '([totalRevenue] - SUM([cost])) / [totalRevenue]',
        {
          totalRevenue: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
          cost: 'DM.Commerce.Cost',
        },
        null,
        'Profitability Ratio Description',
      ],
    },
    {
      function: 'measureFactory.customFormula',
      args: [
        'Revenue When Cost Under 100',
        'CASE WHEN [cost] < 100 THEN [revenue] ELSE 0 END',
        {
          cost: { function: 'measureFactory.sum', args: ['DM.Commerce.Cost'] },
          revenue: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
        },
      ],
    },
  ],
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Commerce.Date.Months', ['2012-01-01T00:00:00']],
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
};

export const SAMPLE_ECOMMERCE_QUERY_WITH_STYLED_COLUMNS: QueryJSON = {
  dimensions: ['DM.Commerce.Date.Years', { column: 'DM.Commerce.Gender', sortType: 'sortAsc' }],
  measures: [
    {
      column: {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Total Revenue'],
      },
      sortType: 'sortDesc',
    },
  ],
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Commerce.Gender', ['Female', 'Male']],
    },
  ],
};

export const SAMPLE_ECOMMERCE_QUERY_WITH_TREND_AND_FORECAST_MEASURES: QueryJSON = {
  dimensions: ['DM.Commerce.Date.Months'],
  measures: [
    {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue', 'Total Revenue'],
    },
    {
      function: 'measureFactory.trend',
      args: [
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Total Revenue'],
        },
        'Total Revenue Trend',
        { modelType: 'advancedSmoothing' },
      ],
    },
    {
      function: 'measureFactory.forecast',
      args: [
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Total Revenue'],
        },
        'Total Revenue Forecast',
      ],
    },
  ],
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Commerce.Gender', ['Female', 'Male']],
    },
  ],
};

export const SAMPLE_ECOMMERCE_QUERY_WITH_TREND_AND_FORECAST_PROPS: QueryJSON = {
  dimensions: ['DM.Commerce.Date.Months'],
  measures: [
    {
      column: {
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Total Revenue'],
      },
      trend: { modelType: 'advancedSmoothing' },
      forecast: { forecastHorizon: 6 },
    },
  ],
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Commerce.Gender', ['Female', 'Male']],
    },
  ],
};

/**
 * ECommerce query with `filterFactory.logic.and` / `filterFactory.logic.or` filter relations:
 * (empty gender members OR total cost > 1000) AND (country members, profit band, quarter date range
 * on `DM.Commerce.Date.Quarters` as ISO bounds for Q1 2011 through Q3 2012, country starts with "U").
 * NLQ JSON requires ISO date strings for `filterFactory.dateRange` bounds, not labels like `2011-Q1`.
 * The second `logic.and` argument is a `Filter[]`; sdk-data `relate()`
 * turns that array into one AND chain, so this stays one `logic.and` and one `logic.or` in JSON.
 */
export const SAMPLE_ECOMMERCE_QUERY_WITH_NESTED_FILTER_RELATIONS: QueryJSON = {
  dimensions: ['DM.Commerce.Date.Quarters', 'DM.Country.Country', 'DM.Commerce.Gender'],
  measures: [
    {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue', 'Total Revenue'],
    },
    {
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Cost', 'Total Cost'],
    },
  ],
  filters: [
    {
      function: 'filterFactory.logic.and',
      args: [
        {
          function: 'filterFactory.logic.or',
          args: [
            {
              function: 'filterFactory.members',
              args: ['DM.Commerce.Gender', []],
            },
            {
              function: 'filterFactory.measureGreaterThan',
              args: [
                {
                  function: 'measureFactory.sum',
                  args: ['DM.Commerce.Cost', 'Total Cost'],
                },
                1000,
              ],
            },
          ],
        },
        [
          {
            function: 'filterFactory.members',
            args: ['DM.Country.Country', []],
          },
          {
            function: 'filterFactory.dateRange',
            args: ['DM.Commerce.Date.Quarters', '2011-01-01T00:00:00', '2013-09-30T23:59:59'],
          },
          {
            function: 'filterFactory.startsWith',
            args: ['DM.Country.Country', 'U'],
          },
        ],
      ],
    },
  ],
};

export const SAMPLE_HEALTHCARE_DEFAULT_QUERY: QueryJSON = {
  dimensions: ['DM.Admissions.Admission_Time.Months'],
  measures: [
    {
      function: 'measureFactory.count',
      args: ['DM.Admissions.ID', 'Number of Admissions'],
    },
  ],
  filters: [
    {
      function: 'filterFactory.dateRange',
      args: ['DM.Admissions.Admission_Time', '2013-01-01T00:00:00', '2013-12-31T23:59:59'],
    },
  ],
};

/**
 * Healthcare query: average days admitted (length of stay) and its year-over-year growth.
 * Mirrors JAQL: value = Avg(DDiff(Discharge_Time, Admission_Time)), secondary = GrowthPastYear(...).
 */
export const SAMPLE_HEALTHCARE_AVG_DAYS_ADMITTED_WITH_ANNUAL_CHANGE: QueryJSON = {
  dimensions: [],
  measures: [
    {
      function: 'measureFactory.customFormula',
      args: [
        'AVG DAYS ADMITTED',
        'Avg(DDiff([discharge],[admission]))',
        {
          discharge: 'DM.Admissions.Discharge_Time',
          admission: 'DM.Admissions.Admission_Time',
        },
      ],
    },
    {
      function: 'measureFactory.growthPastYear',
      args: [
        {
          function: 'measureFactory.customFormula',
          args: [
            'AVERAGE DAYS ADMITTED',
            'Avg(DDiff([discharge],[admission]))',
            {
              discharge: 'DM.Admissions.Discharge_Time',
              admission: 'DM.Admissions.Admission_Time',
            },
          ],
        },
        'ANNUAL CHANGE',
      ],
    },
  ],
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Admissions.Admission_Time.Years', ['2013-01-01T00:00:00']],
    },
  ],
};

/** certified_data_model_for_ai: sum cube storage (GB) by license, filtered to account ATOBI and one day. */
export const CERTIFIED_DATA_MODEL_FOR_AI_CUBE_SIZE_BY_LICENSE_ATOBI_QUERY: QueryJSON = {
  dimensions: ['DM.DIM_LICENSE.LICENSE_NAME'],
  measures: [
    {
      function: 'measureFactory.sum',
      args: ['DM.AGG_CUBES_ALL_ACTIVITY_DAILY.CUBE_SIZE_GB', 'Total CUBE_SIZE_GB'],
    },
  ],
  filters: [
    {
      function: 'filterFactory.equals',
      args: ['DM.DIM_ACCOUNT.NAME', 'ATOBI'],
    },
    {
      function: 'filterFactory.dateRange',
      args: [
        'DM.AGG_CUBES_ALL_ACTIVITY_DAILY.DTE.Days',
        '2026-04-22T00:00:00',
        '2026-04-22T23:59:59',
      ],
    },
  ],
};

export const CERTIFIED_DATA_MODEL_FOR_AI_TOP_10_ACCOUNTS_BY_DEPLOYMENTS_COUNT_QUERY: QueryJSON = {
  dimensions: ['DM.DIM_ACCOUNT.ACCOUNT_ID', 'DM.DIM_ACCOUNT.NAME'],
  measures: [
    {
      function: 'measureFactory.customFormula',
      args: [
        'Deployments Count',
        '([91A9B-091], [2D7F3-473], [CCF31-AFC],[F8179-9D0])',
        {
          '[91A9B-091]': {
            function: 'measureFactory.countDistinct',
            args: [
              'DM.FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.UNIQUE_DEPLOYMENT_MACHINE_ID',
              '# of unique UNIQUE_DEPLOYMENT_MACHINE_ID (with clones)',
            ],
          },
          '[2D7F3-473]': {
            function: 'filterFactory.members',
            args: ['DM.DIM_ACCOUNT.ACTIVE_CUSTOMER', ['true']],
          },
          '[CCF31-AFC]': {
            function: 'filterFactory.members',
            args: ['DM.DIM_LICENSE.ACTIVE_LICENSE', ['true']],
          },
          '[F8179-9D0]': {
            function: 'filterFactory.members',
            args: ['DM.DIM_DEPLOYMENT.IS_ACTIVE_LAST_30D', ['Yes']],
          },
        },
      ],
    },
  ],
  filters: [
    {
      function: 'filterFactory.topRanking',
      args: [
        'DM.DIM_ACCOUNT.ACCOUNT_ID',
        {
          function: 'measureFactory.customFormula',
          args: [
            'Deployments Count',
            '([91A9B-091], [2D7F3-473], [CCF31-AFC],[F8179-9D0])',
            {
              '[91A9B-091]': {
                function: 'measureFactory.countDistinct',
                args: [
                  'DM.FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.UNIQUE_DEPLOYMENT_MACHINE_ID',
                  '# of unique UNIQUE_DEPLOYMENT_MACHINE_ID (with clones)',
                ],
              },
              '[2D7F3-473]': {
                function: 'filterFactory.members',
                args: ['DM.DIM_ACCOUNT.ACTIVE_CUSTOMER', ['true']],
              },
              '[CCF31-AFC]': {
                function: 'filterFactory.members',
                args: ['DM.DIM_LICENSE.ACTIVE_LICENSE', ['true']],
              },
              '[F8179-9D0]': {
                function: 'filterFactory.members',
                args: ['DM.DIM_DEPLOYMENT.IS_ACTIVE_LAST_30D', ['Yes']],
              },
            },
          ],
        },
        10,
      ],
    },
  ],
};

export const BENCHMARK_SNOWFLAKE_DEFAULT_QUERY: QueryJSON = {
  dimensions: ['DM.part.P_SIZE', 'DM.lineitem.L_SHIPDATE.Minutes'],
  measures: [
    {
      function: 'measureFactory.sum',
      args: ['DM.partsupp.PS_SUPPLYCOST', 'Total Supply Cost'],
    },
    {
      function: 'measureFactory.rank',
      args: ['DM.partsupp.PS_SUPPLYCOST', 'Part Size Rank', 'DESC', '1224', 'DM.part.P_SIZE'],
    },
    {
      function: 'measureFactory.customFormula',
      args: ['Log10 of Total Quantity', 'LOG10(SUM(DM.lineitem.L_QUANTITY))', {}],
    },
  ],
  filters: [
    {
      function: 'filterFactory.equals',
      args: ['DM.lineitem.L_RECEIPTDATE', '1111-11-11T00:00:00'],
    },
    {
      function: 'filterFactory.dateRange',
      args: ['DM.lineitem.L_COMMITDATE', '00:00:00', '00:30:00'],
    },
    {
      function: 'filterFactory.topRanking',
      args: [
        'DM.part.P_SIZE',
        {
          function: 'measureFactory.sum',
          args: ['DM.partsupp.PS_SUPPLYCOST'],
        },
        10,
      ],
    },
  ],
};

export const BENCHMARK_SNOWFLAKE_TOTAL_PRICE_AND_QUANTITY_GROWTH_SUMMARY_QUERY: QueryJSON = {
  dimensions: [],
  measures: [
    {
      function: 'measureFactory.measuredValue',
      args: [
        {
          function: 'measureFactory.sum',
          args: ['DM.orders.O_TOTALPRICE', 'Total Price (Last Year)'],
        },
        [
          {
            function: 'filterFactory.dateRelative',
            args: ['DM.orders.O_ORDERDATE.Years', -1, 1],
          },
        ],
        'Total Price (Last Year)',
      ],
    },
    {
      function: 'measureFactory.sum',
      args: ['DM.orders.O_TOTALPRICE', 'Total Price All Orders'],
    },
    {
      function: 'measureFactory.growthPastMonth',
      args: [
        {
          function: 'measureFactory.sum',
          args: ['DM.lineitem.L_QUANTITY'],
        },
        'Quantity Growth',
      ],
    },
  ],
  filters: [],
};
