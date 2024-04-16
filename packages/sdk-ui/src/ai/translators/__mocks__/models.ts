import { ExpandedQueryModel, SimpleQueryModel } from '@/ai';

export const MOCK_EXPANDED_QUERY_MODEL = {
  jaql: {
    datasource: { title: 'Sample ECommerce' },
    metadata: [
      // should remove "table", "column", and "datatype"
      {
        jaql: {
          dim: '[Commerce.Condition]',
          table: 'Commerce',
          column: 'Condition',
          datatype: 'text',
          title: 'Condition',
        },
        panel: 'columns',
      },
      // should simplify simple formula to an agg measure
      {
        jaql: {
          type: 'measure',
          context: {
            '[d6fb]': {
              dim: '[Commerce.Revenue]',
              table: 'Commerce',
              column: 'Revenue',
            },
          },
          formula: 'sum([d6fb])',
          title: 'Total Revenue',
        },
        panel: 'measures',
      },
      // should simplify format by keeping only the date format specified
      {
        jaql: {
          dim: '[Commerce.Date]',
          level: 'months',
          title: 'Months in Date',
        },
        format: {
          mask: {
            days: 'shortDate',
            isdefault: true,
            minutes: 'HH:mm',
            months: 'M-yy',
            quarters: 'yyyy Q',
            weeks: 'ww yyyy',
            years: 'yyyy',
          },
        },
        panel: 'measures',
      },
      // should remove format from filter
      {
        jaql: {
          dim: '[Commerce.Date]',
          level: 'years',
          filter: {
            from: '2012-01-01T00:00:00',
            to: '2013-12-31T00:00:00',
          },
          title: 'Date from 2012 to 2013',
        },
        format: {
          mask: {
            days: 'shortDate',
            isdefault: true,
            minutes: 'HH:mm',
            months: 'M-yy',
            quarters: 'yyyy Q',
            weeks: 'ww yyyy',
            years: 'yyyy',
          },
        },
        panel: 'scope',
      },
      // should simplify simple formula in filter.by
      {
        jaql: {
          table: 'Brand',
          column: 'Brand',
          datatype: 'text',
          title: 'Top 10 Brand by Total Revenue',
          dim: '[Brand.Brand]',
          filter: {
            top: '10',
            by: {
              type: 'measure',
              context: {
                '[d6fb]': {
                  dim: '[Commerce.Revenue]',
                  table: 'Commerce',
                  column: 'Revenue',
                },
              },
              formula: ' sum([d6fb])',
            },
          },
        },
        panel: 'scope',
      },
    ],
  },
  queryTitle: 'Expanded Query Title',
  chartRecommendations: {
    chartFamily: 'table',
    chartType: 'table',
    axesMapping: { columns: [{ name: 'Condition' }, { name: 'Total Revenue' }] },
  },
} as ExpandedQueryModel;

export const MOCK_SIMPLE_QUERY_MODEL = {
  model: 'Sample ECommerce',
  metadata: [
    {
      jaql: {
        dim: '[Commerce.Condition]',
        title: 'Condition',
      },
    },
    {
      jaql: {
        dim: '[Commerce.Revenue]',
        agg: 'sum',
        title: 'Total Revenue',
      },
    },
    {
      jaql: {
        dim: '[Commerce.Date]',
        level: 'months',
        title: 'Months in Date',
      },
      format: {
        mask: {
          months: 'M-yy',
        },
      },
    },
    {
      jaql: {
        dim: '[Commerce.Date]',
        level: 'years',
        filter: {
          from: '2012-01-01T00:00:00',
          to: '2013-12-31T00:00:00',
        },
        title: 'Date from 2012 to 2013',
      },
      panel: 'scope',
    },
    {
      jaql: {
        title: 'Top 10 Brand by Total Revenue',
        dim: '[Brand.Brand]',
        filter: {
          top: '10',
          by: {
            dim: '[Commerce.Revenue]',
            agg: 'sum',
          },
        },
      },
      panel: 'scope',
    },
  ],
  chart: {
    chartType: 'table',
    dataOptions: {
      columns: [
        {
          name: 'Condition',
        },
        {
          name: 'Total Revenue',
        },
      ],
    },
  },
  queryTitle: 'table showing expanded query title',
} as SimpleQueryModel;

export const MOCK_RE_EXPANDED_QUERY_MODEL = {
  jaql: {
    datasource: {
      title: 'Sample ECommerce',
    },
    metadata: [
      {
        jaql: {
          table: 'Commerce',
          column: 'Condition',
          datatype: 'text',
          title: 'Condition',
          dim: '[Commerce.Condition]',
        },
      },
      {
        jaql: {
          table: 'Commerce',
          column: 'Revenue',
          datatype: 'numeric',
          title: 'Total Revenue',
          dim: '[Commerce.Revenue]',
          agg: 'sum',
        },
      },
      {
        jaql: {
          table: 'Commerce',
          column: 'Date',
          datatype: 'datetime',
          title: 'Months in Date',
          dim: '[Commerce.Date]',
          level: 'months',
        },
        format: {
          mask: {
            months: 'M-yy',
          },
        },
      },
      {
        jaql: {
          table: 'Commerce',
          column: 'Date',
          datatype: 'datetime',
          title: 'Date from 2012 to 2013',
          dim: '[Commerce.Date]',
          level: 'years',
          filter: {
            from: '2012-01-01T00:00:00',
            to: '2013-12-31T00:00:00',
          },
        },
        panel: 'scope',
      },
      {
        jaql: {
          table: 'Brand',
          column: 'Brand',
          datatype: 'text',
          title: 'Top 10 Brand by Total Revenue',
          dim: '[Brand.Brand]',
          filter: {
            top: '10',
            by: {
              table: 'Commerce',
              column: 'Revenue',
              datatype: 'numeric',
              title: 'sum Revenue',
              dim: '[Commerce.Revenue]',
              agg: 'sum',
            },
          },
        },
        panel: 'scope',
      },
    ],
  },
  chartRecommendations: {
    chartFamily: 'table',
    chartType: 'table',
    axesMapping: {
      columns: [
        {
          name: 'Condition',
        },
        {
          name: 'Total Revenue',
        },
      ],
    },
  },
  queryTitle: 'table showing expanded query title',
} as ExpandedQueryModel;

export const MOCK_QUERY_YAML = `# bar chart of total of revenue by condition

model: Sample ECommerce
metadata:
  - jaql:
      dim: "[Commerce.Condition]"
      title: Condition
  - jaql:
      dim: "[Commerce.Revenue]"
      agg: sum
      title: total of Revenue
  - jaql:
      title: Country
      dim: "[Country.Country]"
      filter:
        members:
          - Cambodia
          - United States
    panel: scope
  - jaql:
      title: Years
      dim: "[Commerce.Date]"
      level: years
      filter:
        members:
          - "2013-01-01T00:00:00"
    format:
      mask:
        years: yyyy
    panel: scope
  - jaql:
      title: Revenue
      dim: "[Commerce.Revenue]"
      filter:
        fromNotEqual: 1000
    panel: scope
chart:
  chartType: bar
  dataOptions:
    category:
      - name: Condition
    value:
      - name: total of Revenue`;

export const MOCK_CODE_REACT = `import { ChartWidget } from '@sisense/sdk-ui';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  return (
    <ChartWidget
      title={'bar chart of total of revenue by condition'}
      dataSource={DM.DataSource}
      chartType={'bar'}
      dataOptions={ {
    category: [
      DM.Commerce.Condition
    ],
    value: [
      measureFactory.sum(DM.Commerce.Revenue, 'total of Revenue')
    ],
    breakBy: [],
  } }
      filters={ [
    filterFactory.members(DM.Country.Country, ['Cambodia', 'United States']),
    filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
    filterFactory.greaterThan(DM.Commerce.Revenue, 1000)
    ] }
    />
  );
}`;

export const MOCK_DATA_SOURCE_FIELDS = [
  {
    id: '[Brand.Brand]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Brand',
    table: 'Brand',
    column: 'Brand',
    merged: false,
    indexed: true,
  },
  {
    id: '[Brand.Brand ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Brand ID',
    table: 'Brand',
    column: 'Brand ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Category.Category]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Category',
    table: 'Category',
    column: 'Category',
    merged: false,
    indexed: true,
  },
  {
    id: '[Category.Category ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Category ID',
    table: 'Category',
    column: 'Category ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Commerce.Age Range]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Age Range',
    table: 'Commerce',
    column: 'Age Range',
    merged: false,
    indexed: true,
  },
  {
    id: '[Commerce.Brand ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Brand ID',
    table: 'Commerce',
    column: 'Brand ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Commerce.Category ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Category ID',
    table: 'Commerce',
    column: 'Category ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Commerce.Condition]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Condition',
    table: 'Commerce',
    column: 'Condition',
    merged: false,
    indexed: true,
  },
  {
    id: '[Commerce.Cost]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Cost',
    table: 'Commerce',
    column: 'Cost',
    merged: false,
    indexed: false,
  },
  {
    id: '[Commerce.Country ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Country ID',
    table: 'Commerce',
    column: 'Country ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Commerce.Date (Calendar)]',
    type: 'dimension',
    dimtype: 'datetime',
    title: 'Date',
    table: 'Commerce',
    column: 'Date',
    merged: false,
    indexed: true,
  },
  {
    id: '[Commerce.Gender]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Gender',
    table: 'Commerce',
    column: 'Gender',
    merged: false,
    indexed: true,
  },
  {
    id: '[Commerce.Quantity]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Quantity',
    table: 'Commerce',
    column: 'Quantity',
    merged: false,
    indexed: false,
  },
  {
    id: '[Commerce.Revenue]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Revenue',
    table: 'Commerce',
    column: 'Revenue',
    merged: false,
    indexed: false,
  },
  {
    id: '[Commerce.Visit ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Visit ID',
    table: 'Commerce',
    column: 'Visit ID',
    merged: false,
    indexed: false,
  },
  {
    id: '[Country.Country]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Country',
    table: 'Country',
    column: 'Country',
    merged: true,
    indexed: true,
  },
  {
    id: '[Country.Country ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Country ID',
    table: 'Country',
    column: 'Country ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[CountryPopulation.Continent]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Continent',
    table: 'CountryPopulation',
    column: 'Continent',
    merged: false,
    indexed: true,
  },
  {
    id: '[CountryPopulation.Country Code]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Country Code',
    table: 'CountryPopulation',
    column: 'Country Code',
    merged: false,
    indexed: true,
  },
  {
    id: '[CountryPopulation.Country Name]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Country Name',
    table: 'CountryPopulation',
    column: 'Country Name',
    merged: true,
    indexed: true,
  },
  {
    id: '[CountryPopulation.Population]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Population',
    table: 'CountryPopulation',
    column: 'Population',
    merged: false,
    indexed: false,
  },
];
