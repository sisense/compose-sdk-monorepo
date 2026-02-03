import { ExpandedQueryModel, SimpleQueryModel } from '../types.js';

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
      // should simplify simple formula to an agg measure while keeping the filter
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
          filter: {
            top: '4',
          },
          title: 'top 4 by total of Revenue',
        },
        panel: 'scope',
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
        panel: 'columns',
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
    chartFamily: 'cartesian',
    chartType: 'column',
    axesMapping: {
      category: [{ name: 'Condition', type: 'string' }],
      value: [{ name: 'Total Revenue', type: 'number' }],
    },
    styleOptions: {
      legend: {
        position: 'top',
      },
    },
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
        dim: '[Commerce.Revenue]',
        agg: 'sum',
        filter: {
          top: '4',
        },
        title: 'top 4 by total of Revenue',
      },
      panel: 'scope',
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
    chartType: 'column',
    dataOptions: {
      category: [
        {
          column: {
            name: 'Condition',
            type: 'string',
          },
        },
      ],
      value: [
        {
          column: {
            name: 'Total Revenue',
            type: 'number',
          },
        },
      ],
    },
    styleOptions: {
      legend: {
        position: 'top',
      },
    },
  },
  queryTitle: 'column chart showing expanded query title',
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
          column: 'Revenue',
          datatype: 'numeric',
          dim: '[Commerce.Revenue]',
          agg: 'sum',
          filter: {
            top: '4',
          },
          title: 'top 4 by total of Revenue',
        },
        panel: 'scope',
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
    chartFamily: 'cartesian',
    chartType: 'column',
    axesMapping: {
      category: [
        {
          column: {
            name: 'Condition',
            type: 'string',
          },
        },
      ],
      value: [
        {
          column: {
            name: 'Total Revenue',
            type: 'number',
          },
        },
      ],
    },
    styleOptions: {
      legend: {
        position: 'top',
      },
    },
  },
  queryTitle: 'column chart showing expanded query title',
} as ExpandedQueryModel;

export const MOCK_SIMPLE_QUERY_YAML = `# Column chart showing expanded query title
---
model: Sample ECommerce
metadata:
  - jaql:
      dim: "[Commerce.Condition]"
      title: Condition
  - jaql:
      dim: "[Commerce.Revenue]"
      agg: sum
      title: Total Revenue
  - jaql:
      dim: "[Commerce.Revenue]"
      agg: sum
      filter:
        top: "4"
      title: top 4 by total of Revenue
    panel: scope
  - jaql:
      dim: "[Commerce.Date]"
      level: months
      title: Months in Date
    format:
      mask:
        months: M-yy
  - jaql:
      dim: "[Commerce.Date]"
      level: years
      filter:
        from: 2012-01-01T00:00:00
        to: 2013-12-31T00:00:00
      title: Date from 2012 to 2013
    panel: scope
  - jaql:
      title: Top 10 Brand by Total Revenue
      dim: "[Brand.Brand]"
      filter:
        top: "10"
        by:
          dim: "[Commerce.Revenue]"
          agg: sum
    panel: scope
chart:
  chartType: column
  dataOptions:
    category:
      - column:
          name: Condition
          type: string
    value:
      - column:
          name: Total Revenue
          type: number
  styleOptions:
    legend:
      position: top
`;

export const MOCK_QUERY_YAML_1 = `# bar chart of total of revenue by condition

model: Sample ECommerce
metadata:
  - jaql:
      dim: "[Commerce.Condition]"
      title: Condition
  - jaql:
      dim: "[Commerce.Revenue]"
      agg: sum
      sort: desc
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

export const MOCK_QUERY_MODEL_1 = {
  jaql: {
    datasource: {
      id: 'localhost_aSampleIAAaECommerce',
      address: 'LocalHost',
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
          title: 'total of Revenue',
          dim: '[Commerce.Revenue]',
          agg: 'sum',
          sort: 'desc',
        },
      },
      {
        jaql: {
          table: 'Country',
          column: 'Country',
          datatype: 'text',
          title: 'Country',
          dim: '[Country.Country]',
          filter: {
            members: ['Cambodia', 'United States'],
          },
        },
        panel: 'scope',
      },
      {
        jaql: {
          table: 'Commerce',
          column: 'Date',
          datatype: 'datetime',
          title: 'Years',
          dim: '[Commerce.Date]',
          level: 'years',
          filter: {
            members: ['2013-01-01T00:00:00'],
          },
        },
        format: {
          mask: {
            years: 'yyyy',
          },
        },
        panel: 'scope',
      },
      {
        jaql: {
          table: 'Commerce',
          column: 'Revenue',
          datatype: 'numeric',
          title: 'Revenue',
          dim: '[Commerce.Revenue]',
          filter: {
            fromNotEqual: 1000,
          },
        },
        panel: 'scope',
      },
    ],
  },
  chartRecommendations: {
    chartFamily: 'cartesian',
    chartType: 'bar',
    axesMapping: {
      category: [
        {
          name: 'Condition',
        },
      ],
      value: [
        {
          name: 'total of Revenue',
        },
      ],
    },
  },
  queryTitle: 'bar chart of total of revenue by condition',
} as ExpandedQueryModel;

export const MOCK_QUERY_MODEL_2 = {
  queryTitle: 'Total Revenue by Year',
  chartRecommendations: {
    chartType: 'table',
    chartFamily: 'table',
  },
  jaql: {
    datasource: {
      id: 'localhost_aSampleIAAaECommerce',
      address: 'LocalHost',
      title: 'Sample ECommerce',
    },
    metadata: [
      {
        jaql: {
          column: 'Date',
          datatype: 'datetime',
          dim: '[Commerce.Date]',
          firstday: 'mon',
          level: 'years',
          table: 'Commerce',
          title: 'Date',
        },
        format: {
          mask: {
            days: 'shortDate',
            minutes: 'HH:mm',
            months: 'MM/yyyy',
            quarters: 'yyyy Q',
            weeks: 'ww yyyy',
            years: 'yyyy',
          },
        },
      },
      {
        jaql: {
          agg: 'sum',
          column: 'Revenue',
          datatype: 'numeric',
          dim: '[Commerce.Revenue]',
          table: 'Commerce',
          title: 'total of Revenue',
        },
      },
    ],
  },
} as ExpandedQueryModel;

export const MOCK_QUERY_YAML_2 = `# table chart of total of revenue by condition

model: Sample ECommerce
metadata:
  - jaql:
      dim: "[Commerce.Condition]"
      title: Condition
  - jaql:
      dim: "[Commerce.Revenue]"
      agg: sum
      sort: desc
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
    panel: scope`;
