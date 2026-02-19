import { SharedFormulaDto } from '@/domains/widgets/components/widget-by-id/types';
import { DashboardDto } from '@/infra/api/types/dashboard-dto';

export const dashboardWithSharedFormulas = {
  title: 'shared-formula (1)',
  style: {},
  layout: {
    instanceid: '39478-DA23-28',
    type: 'columnar',
    columns: [
      {
        width: 100,
        cells: [
          {
            subcells: [
              {
                elements: [
                  {
                    minHeight: 96,
                    maxHeight: 2048,
                    minWidth: 128,
                    maxWidth: 2048,
                    height: 384,
                    defaultWidth: 512,
                    widgetid: '675325cb65ad730034b436f1',
                  },
                ],
                width: 100,
                stretchable: false,
                pxlWidth: 1543.21,
                index: 0,
              },
            ],
          },
          {
            subcells: [
              {
                elements: [
                  {
                    minHeight: 64,
                    maxHeight: 1028,
                    height: 192,
                    minWidth: 48,
                    maxWidth: 1028,
                    defaultWidth: 512,
                    widgetid: '6758464e65ad730034b43751',
                  },
                ],
              },
            ],
          },
        ],
        pxlWidth: 1543.21,
        index: 0,
      },
    ],
    container: {},
  },
  oid: '675325cb65ad730034b436f0',
  datasource: {
    address: 'LocalHost',
    title: 'Sample ECommerce',
    id: 'localhost_aSampleIAAaECommerce',
    database: 'aSampleIAAaECommerce',
    fullname: 'localhost/Sample ECommerce',
    live: false,
  },
  filters: [],
  widgets: [
    {
      _id: '6753266ae2d924c029c93dd2',
      title: '1',
      type: 'chart/column',
      subtype: 'column/classic',
      oid: '675325cb65ad730034b436f1',
      desc: null,
      source: null,
      owner: '662ba7319f04e5001cbc7f58',
      created: '2024-12-06T16:26:51.444Z',
      lastUpdated: '2024-12-10T13:46:30.590Z',
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
            name: 'categories',
            items: [
              {
                jaql: {
                  table: 'Commerce',
                  column: 'Age Range',
                  dim: '[Commerce.Age Range]',
                  datatype: 'text',
                  merged: true,
                  title: 'Age Range',
                },
                instanceid: '995C0-E51E-8C',
                field: {
                  id: '[Commerce.Age Range]',
                  index: 0,
                },
                format: {},
                panel: 'rows',
              },
            ],
          },
          {
            name: 'values',
            items: [
              {
                jaql: {
                  type: 'measure',
                  formula: '[4525D-D11]',
                  context: {
                    '[4525D-D11]': {
                      formulaRef: 'e78303f1-820c-4a02-91ab-6d2b8700abeb',
                    },
                  },
                  title: '[average-correlation]',
                },
                instanceid: 'EA32A-6C7E-D5',
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
        usedFormulasMapping: {
          'e78303f1-820c-4a02-91ab-6d2b8700abeb': [
            "metadata.panels[1].items[0].jaql.context['[4525D-D11]']",
          ],
        },
      },
      style: {
        legend: {
          enabled: true,
          position: 'bottom',
        },
        seriesLabels: {
          enabled: false,
          rotation: 0,
          labels: {
            enabled: false,
            types: {
              count: false,
              percentage: false,
              relative: false,
              totals: false,
            },
            stacked: false,
            stackedPercentage: false,
          },
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
          hideMinMax: false,
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
          hideMinMax: false,
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
              id: 'age_range',
              title: 'Age Range',
              singular: 'Age Range',
              plural: 'Age Range',
            },
          ],
        },
      },
      instanceid: 'C784E-1DC1-3A',
      realTimeRefreshing: false,
      options: {
        dashboardFiltersMode: 'select',
        selector: true,
        triggersDomready: true,
        autoUpdateOnEveryChange: true,
        drillToAnywhere: true,
        previousScrollerLocation: {
          min: null,
          max: null,
        },
      },
      dashboardid: '675325cb65ad730034b436f0',
      lastOpened: null,
      userId: '662ba7319f04e5001cbc7f58',
      instanceType: 'owner',
    },
    {
      _id: '675850ade2d924c0294b1acf',
      title: '',
      type: 'indicator',
      subtype: 'indicator/numeric',
      oid: '6758464e65ad730034b43751',
      desc: null,
      source: null,
      owner: '662ba7319f04e5001cbc7f58',
      created: '2024-12-10T13:46:54.908Z',
      lastUpdated: '2024-12-10T14:31:09.923Z',
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
            name: 'value',
            items: [
              {
                jaql: {
                  type: 'measure',
                  formula: '[5A349-31A]',
                  context: {
                    '[5A349-31A]': {
                      formulaRef: '6d3a7c78-e2f6-4233-bac2-adda493e0e37',
                    },
                  },
                  title: '[logarifm of cost]',
                },
                instanceid: 'CBFDE-BDC5-AF',
                format: {
                  mask: {
                    type: 'number',
                    abbreviations: {
                      t: true,
                      b: true,
                      m: true,
                      k: false,
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
            name: 'secondary',
            items: [
              {
                jaql: {
                  type: 'measure',
                  formula: '[02006-0AB]',
                  context: {
                    '[02006-0AB]': {
                      formulaRef: 'e78303f1-820c-4a02-91ab-6d2b8700abeb',
                    },
                  },
                  loadPath: true,
                  title: '[average-correlation]',
                },
                instanceid: '72297-CF53-33',
                format: {
                  mask: {
                    type: 'number',
                    abbreviations: {
                      t: true,
                      b: true,
                      m: true,
                      k: false,
                    },
                    separated: true,
                    decimals: 'auto',
                    abbreviateAll: false,
                    isdefault: true,
                  },
                },
              },
            ],
          },
          {
            name: 'min',
            items: [],
          },
          {
            name: 'max',
            items: [],
          },
          {
            name: 'filters',
            items: [],
          },
        ],
        usedFormulasMapping: {
          '6d3a7c78-e2f6-4233-bac2-adda493e0e37': [
            "metadata.panels[0].items[0].jaql.context['[5A349-31A]']",
          ],
          'e78303f1-820c-4a02-91ab-6d2b8700abeb': [
            "metadata.panels[1].items[0].jaql.context['[02006-0AB]']",
          ],
        },
      },
      tags: [],
      style: {
        subtype: 'simple',
        skin: 'vertical',
        components: {
          title: {
            inactive: false,
            enabled: true,
          },
          icon: {
            inactive: true,
            enabled: true,
          },
          secondaryTitle: {
            inactive: false,
            enabled: true,
          },
        },
        'indicator/numeric': {
          subtype: 'simple',
          skin: 'vertical',
          components: {
            title: {
              inactive: false,
              enabled: true,
            },
            icon: {
              inactive: false,
              enabled: true,
            },
            secondaryTitle: {
              inactive: true,
              enabled: true,
            },
          },
        },
        'indicator/gauge': {
          subtype: 'round',
          skin: '1',
          components: {
            ticks: {
              inactive: false,
              enabled: true,
            },
            labels: {
              inactive: false,
              enabled: true,
            },
            title: {
              inactive: false,
              enabled: true,
            },
            secondaryTitle: {
              inactive: true,
              enabled: true,
            },
          },
        },
        narration: {
          enabled: false,
          display: 'above',
          format: 'bullets',
          verbosity: 'medium',
          up_sentiment: 'good',
          aggregation: 'sum',
          labels: [],
        },
      },
      instanceid: '95FBA-2682-D8',
      realTimeRefreshing: false,
      options: {
        dashboardFiltersMode: 'filter',
        selector: false,
        disallowSelector: true,
        triggersDomready: true,
        autoUpdateOnEveryChange: true,
        supportsHierarchies: false,
      },
      dashboardid: '675325cb65ad730034b436f0',
      userId: '662ba7319f04e5001cbc7f58',
      instanceType: 'owner',
    },
  ],
} as DashboardDto;

export const sharedFormulasDictionary = {
  'e78303f1-820c-4a02-91ab-6d2b8700abeb': {
    oid: 'e78303f1-820c-4a02-91ab-6d2b8700abeb',
    title: 'average-correlation',
    datasourceTitle: 'Sample ECommerce',
    formula: 'AVG(CORREL([388A1-BCC],[4E7D2-8BA]))',
    context: {
      '[388A1-BCC]': {
        table: 'Commerce',
        column: 'Cost',
        dim: '[Commerce.Cost]',
        datatype: 'numeric',
        title: 'Cost',
      },
      '[4E7D2-8BA]': {
        table: 'Commerce',
        column: 'Quantity',
        dim: '[Commerce.Quantity]',
        datatype: 'numeric',
        title: 'Quantity',
      },
    },
    description: '',
    created: '2024-12-06T16:30:00.204Z',
    lastUpdated: '2024-12-06T16:30:00.204Z',
    lastUpdatedUser: '662ba7319f04e5001cbc7f58',
    owner: '662ba7319f04e5001cbc7f58',
  },
  '6d3a7c78-e2f6-4233-bac2-adda493e0e37': {
    oid: '6d3a7c78-e2f6-4233-bac2-adda493e0e37',
    title: 'logarifm of cost',
    datasourceTitle: 'Sample ECommerce',
    formula: 'LN([5CD73-E54])',
    context: {
      '[5CD73-E54]': {
        table: 'Commerce',
        column: 'Cost',
        dim: '[Commerce.Cost]',
        datatype: 'numeric',
        agg: 'sum',
        title: 'Total Cost',
      },
    },
    description: '',
    created: '2024-12-06T16:03:16.223Z',
    lastUpdated: '2024-12-06T16:03:16.223Z',
    lastUpdatedUser: '662ba7319f04e5001cbc7f58',
    owner: '662ba7319f04e5001cbc7f58',
  },
} as Record<string, SharedFormulaDto>;
