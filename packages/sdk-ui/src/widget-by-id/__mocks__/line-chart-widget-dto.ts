import { WidgetDto } from '../types.js';

export const lineChartWidgetDTO: WidgetDto = {
  _id: '66c35c158b702e002ae41724',
  title: '',
  type: 'chart/line',
  subtype: 'line/basic',
  oid: '66c35c158b702e002ae41723',
  desc: 'THIS IS LINE CHART!',
  source: null,
  owner: '662ba7319f04e5001cbc7f58',
  userId: '662ba7319f04e5001cbc7f58',
  created: '2024-08-19T14:52:05.329Z',
  lastUpdated: '2024-08-19T14:52:22.841Z',
  instanceType: 'owner',
  datasource: {
    address: 'LocalHost',
    title: 'Sample ECommerce',
    id: 'localhost_aSampleIAAaECommerce',
    database: 'aSampleIAAaECommerce',
    fullname: 'localhost/Sample ECommerce',
    live: false,
  },
  selection: null,
  metadata: {
    ignore: {
      dimensions: [],
      ids: [],
      all: false,
    },
    panels: [
      {
        name: 'x-axis',
        items: [
          {
            jaql: {
              table: 'Commerce',
              column: 'Date',
              dim: '[Commerce.Date (Calendar)]',
              datatype: 'datetime',
              merged: true,
              level: 'months',
              title: 'Months in Date',
            },
            instanceid: '5B818-A6A7-D3',
            panel: 'rows',
            field: {
              id: '[Commerce.Date (Calendar)]_years',
              index: 0,
            },
            format: {
              mask: {
                years: 'yyyy',
                quarters: 'yyyy Q',
                months: 'MM/yyyy',
                weeks: 'ww yyyy',
                days: 'shortDate',
                minutes: 'HH:mm',
                seconds: 'MM/dd/yyyy HH:mm:ss',
                dateAndTime: 'MM/dd/yyyy HH:mm',
                isdefault: true,
              },
            },
            hierarchies: ['calendar'],
          },
        ],
      },
      {
        name: 'values',
        items: [
          {
            jaql: {
              table: 'Commerce',
              column: 'Cost',
              dim: '[Commerce.Cost]',
              datatype: 'numeric',
              agg: 'sum',
              title: 'Total Cost',
            },
            instanceid: 'E31B8-B218-C7',
            panel: 'measures',
            format: {
              mask: {
                type: 'number',
                abbreviations: {
                  t: true,
                  b: true,
                  m: true,
                  k: true,
                },
                separated: true,
                decimals: 'auto',
                abbreviateAll: false,
                isdefault: true,
              },
              color: {
                colorIndex: 0,
                type: 'color',
              },
            },
          },
        ],
      },
      {
        name: 'break by',
        items: [],
      },
      {
        name: 'filters',
        items: [],
      },
    ],
    usedFormulasMapping: {},
  },
  tags: [],
  style: {
    lineWidth: {
      width: 'bold',
    },
    legend: {
      enabled: true,
      position: 'bottom',
    },
    seriesLabels: {
      enabled: false,
      rotation: 0,
    },
    markers: {
      enabled: false,
      fill: 'filled',
      size: 'small',
    },
    xAxis: {
      enabled: true,
      ticks: true,
      labels: {
        enabled: true,
        rotation: 0,
      },
      title: {
        enabled: false,
      },
      x2Title: {
        enabled: false,
      },
      gridLines: true,
      isIntervalEnabled: false,
    },
    yAxis: {
      inactive: false,
      enabled: true,
      ticks: true,
      labels: {
        enabled: true,
        rotation: 0,
      },
      title: {
        enabled: false,
      },
      gridLines: true,
      logarithmic: false,
      isIntervalEnabled: true,
    },
    y2Axis: {
      inactive: true,
      enabled: true,
      ticks: true,
      labels: {
        enabled: true,
        rotation: 0,
      },
      title: {
        enabled: false,
      },
      gridLines: false,
      logarithmic: false,
      isIntervalEnabled: true,
    },
    navigator: {
      enabled: true,
    },
    dataLimits: {
      seriesCapacity: 50,
      categoriesCapacity: 100000,
    },
    narration: {
      enabled: false,
      display: 'above',
      format: 'bullets',
      verbosity: 'medium',
      up_sentiment: 'good',
      aggregation: 'sum',
      labels: [
        {
          id: 'years_in_date',
          title: 'Years in Date',
          singular: 'Years in Date',
          plural: 'Years in Date',
        },
      ],
    },
  },
  instanceid: '3C0D4-3580-B6',
  realTimeRefreshing: false,
  options: {
    dashboardFiltersMode: 'filter',
    selector: true,
    triggersDomready: true,
    autoUpdateOnEveryChange: true,
    drillToAnywhere: true,
    previousScrollerLocation: {
      min: null,
      max: null,
    },
  },
  dashboardid: '66c35bff8b702e002ae41721',
};
