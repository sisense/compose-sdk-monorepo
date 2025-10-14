import { DashboardDto } from '@/api/types/dashboard-dto';

/**
 * Dashboard with pivot table widget.
 */
export const samplePivotDashboard = {
  _id: '65f25ef7f080b9002af4cf37',
  title: 'Dashboard with pivot table widget',
  oid: '65f25ef7f080b9002af4cf36',
  desc: '',
  source: null,
  type: 'dashboard',
  shares: [
    {
      shareId: '65df80b897bd17001b626d96',
      type: 'user',
    },
  ],
  style: {},
  owner: '65df80b897bd17001b626d96',
  userId: '65df80b897bd17001b626d96',
  created: '2024-03-14T02:20:39.445Z',
  lastUpdated: '2024-03-14T04:43:31.057Z',
  layout: {
    instanceid: '71B22-CFF3-16',
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
                    minHeight: 128,
                    maxHeight: 2048,
                    minWidth: 128,
                    maxWidth: 2048,
                    height: '18px',
                    defaultWidth: 512,
                    widgetid: '65f25f22f080b9002af4cf38',
                    autoHeight: '18px',
                  },
                ],
                width: 100,
                stretchable: false,
                pxlWidth: 0,
                index: 0,
              },
            ],
          },
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
                    widgetid: '65f25f36f080b9002af4cf3a',
                  },
                ],
                width: 100,
                stretchable: false,
                pxlWidth: 1127.27,
                index: 0,
              },
            ],
          },
        ],
        pxlWidth: 0,
        index: 0,
      },
    ],
    container: {
      sizzle1710382843613: {
        undefined: {
          parentNode: [107, 27, true],
        },
      },
    },
  },
  instanceType: 'owner',
  dataExploration: false,
  tenantId: '65df80b897bd17001b626da3',
  lastOpened: '2024-03-14T02:20:40.089Z',
  previewLayout: [],
  datasource: {
    fullname: 'localhost/Sample ECommerce',
    id: 'localhost_aSampleIAAaECommerce',
    address: 'LocalHost',
    database: 'aSampleIAAaECommerce',
    live: false,
    title: 'Sample ECommerce',
  },
  filters: [],
  editing: true,
  settings: {
    autoUpdateOnFiltersChange: true,
  },
  widgets: [
    {
      _id: '65f25f22f080b9002af4cf39',
      title: 'Simple Pivot Table',
      type: 'pivot2',
      subtype: 'pivot2',
      oid: '65f25f22f080b9002af4cf38',
      desc: null,
      source: null,
      owner: '65df80b897bd17001b626d96',
      created: '2024-03-14T02:21:22.518Z',
      lastUpdated: '2024-03-14T02:21:22.518Z',
      datasource: {
        fullname: 'localhost/Sample ECommerce',
        id: 'localhost_aSampleIAAaECommerce',
        address: 'LocalHost',
        database: 'aSampleIAAaECommerce',
        live: false,
        title: 'Sample ECommerce',
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
            name: 'rows',
            items: [
              {
                jaql: {
                  table: 'Brand',
                  column: 'Brand',
                  dim: '[Brand.Brand]',
                  datatype: 'text',
                  merged: true,
                  title: 'Brand',
                },
                instanceid: '3C956-D1E7-67',
                panel: 'rows',
                field: {
                  id: '[Brand.Brand]',
                  index: 0,
                },
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
                instanceid: '11705-D62A-21',
                panel: 'measures',
                field: {
                  id: '[Commerce.Cost]_sum',
                  index: 2,
                },
                format: {
                  mask: {
                    type: 'number',
                    t: true,
                    b: true,
                    separated: true,
                    decimals: 'auto',
                    isdefault: true,
                  },
                  color: {
                    type: 'color',
                  },
                },
              },
            ],
          },
          {
            name: 'columns',
            items: [
              {
                jaql: {
                  table: 'Commerce',
                  column: 'Gender',
                  dim: '[Commerce.Gender]',
                  datatype: 'text',
                  merged: true,
                  title: 'Gender',
                },
                instanceid: 'C2AE6-3378-3F',
                panel: 'columns',
                field: {
                  id: '[Commerce.Gender]',
                  index: 1,
                },
              },
            ],
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
        scroll: false,
        pageSize: 25,
        automaticHeight: true,
        colors: {
          rows: true,
          columns: false,
          headers: false,
          members: false,
          totals: false,
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
              id: 'brand',
              title: 'Brand',
              singular: 'Brand',
              plural: 'Brand',
            },
            {
              id: 'gender',
              title: 'Gender',
              singular: 'Gender',
              plural: 'Gender',
            },
          ],
        },
      },
      instanceid: '42E2D-129A-77',
      realTimeRefreshing: false,
      options: {
        dashboardFiltersMode: 'filter',
        selector: false,
        triggersDomready: true,
        drillToAnywhere: true,
        autoUpdateOnEveryChange: true,
      },
      dashboardid: '65f25ef7f080b9002af4cf36',
      userId: '65df80b897bd17001b626d96',
      instanceType: 'owner',
    },
    {
      _id: '65f25f3e2b89103151cc7d0d',
      title: 'Simple Pie Chart',
      type: 'chart/pie',
      subtype: 'pie/classic',
      oid: '65f25f36f080b9002af4cf3a',
      desc: null,
      source: null,
      owner: '65df80b897bd17001b626d96',
      created: '2024-03-14T02:21:42.132Z',
      lastUpdated: '2024-03-14T02:21:50.654Z',
      datasource: {
        fullname: 'localhost/Sample ECommerce',
        id: 'localhost_aSampleIAAaECommerce',
        address: 'LocalHost',
        database: 'aSampleIAAaECommerce',
        live: false,
        title: 'Sample ECommerce',
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
                  table: 'Category',
                  column: 'Category',
                  dim: '[Category.Category]',
                  datatype: 'text',
                  merged: true,
                  title: 'Category',
                },
                instanceid: '1DB1A-83E9-8A',
                field: {
                  id: '[Category.Category]',
                  index: 0,
                },
                format: {
                  members: {},
                },
              },
            ],
          },
          {
            name: 'values',
            items: [
              {
                jaql: {
                  table: 'Commerce',
                  column: 'Revenue',
                  dim: '[Commerce.Revenue]',
                  datatype: 'numeric',
                  agg: 'sum',
                  title: 'Total Revenue',
                },
                instanceid: '20824-D69B-C5',
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
                },
              },
            ],
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
        legend: {
          enabled: false,
          position: 'left',
        },
        labels: {
          enabled: true,
          categories: true,
          value: false,
          percent: true,
          decimals: false,
          fontFamily: 'Open Sans',
          color: 'red',
        },
        convolution: {
          enabled: true,
          selectedConvolutionType: 'byPercentage',
          minimalIndependentSlicePercentage: 3,
          independentSlicesCount: 7,
        },
        dataLimits: {
          seriesCapacity: 100000,
        },
      },
      instanceid: '9BFDD-7918-C1',
      realTimeRefreshing: false,
      options: {
        dashboardFiltersMode: 'select',
        selector: true,
        triggersDomready: true,
        autoUpdateOnEveryChange: true,
        drillToAnywhere: true,
      },
      dashboardid: '65f25ef7f080b9002af4cf36',
      userId: '65df80b897bd17001b626d96',
      instanceType: 'owner',
    },
  ],
  userAuth: expect.anything(),
} as unknown as DashboardDto;
