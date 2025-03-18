import { WidgetDto } from '@/widget-by-id/types';

export const MOCK_WIDGET_DTO_LINE_CHART = {
  _id: '6560ce3b6f1df500326a06b7',
  title: 'REVENUE vs.UNITS SOLD',
  type: 'chart/line',
  subtype: 'line/spline',
  oid: '6560ce3b6f1df500326a06a4',
  desc: null,
  source: null,
  owner: '64b933f34e4e67001a40353e',
  userId: '64b933f34e4e67001a40353e',
  created: '2023-11-24T16:24:27.496Z',
  lastUpdated: '2023-11-24T16:24:27.496Z',
  instanceType: 'owner',
  datasource: {
    title: 'Sample ECommerce',
    id: 'localhost_aSampleIAAaECommerce',
    address: 'LocalHost',
    database: 'aSampleIAAaECommerce',
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
            format: {
              mask: {
                years: 'yyyy',
                quarters: 'yyyy Q',
                months: 'M-yy',
                days: 'shortDate',
              },
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
                isdefault: true,
              },
              color: {
                type: 'color',
              },
            },
          },
          {
            jaql: {
              table: 'Commerce',
              column: 'Quantity',
              dim: '[Commerce.Quantity]',
              datatype: 'numeric',
              agg: 'sum',
              title: 'Total Quantity',
            },
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
                isdefault: true,
              },
              color: {
                type: 'color',
              },
            },
            y2: true,
            singleSeriesType: 'column',
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
  },
  dashboardid: '6560ce3b6f1df500326a069c',
  options: {
    dashboardFiltersMode: 'filter',
    selector: true,
    triggersDomready: true,
  },
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
      enabled: true,
      fill: 'hollow',
      size: 'small',
    },
    xAxis: {
      enabled: true,
      ticks: true,
      labels: {
        enabled: true,
        rotation: 0,
      },
      gridLines: false,
      title: {
        enabled: false,
        text: 'MONTH',
      },
      x2Title: {
        enabled: false,
      },
      intervalEnabled: false,
    },
    yAxis: {
      inactive: false,
      enabled: true,
      ticks: true,
      labels: {
        enabled: true,
        rotation: 0,
      },
      gridLines: true,
      logarithmic: true,
      title: {
        enabled: true,
        text: 'SALES',
      },
      min: null,
      intervalEnabled: false,
    },
    y2Axis: {
      inactive: false,
      enabled: true,
      ticks: true,
      labels: {
        enabled: true,
        rotation: 0,
      },
      gridLines: false,
      logarithmic: false,
      title: {
        enabled: true,
        text: 'QUANTITY',
      },
      templateMainYHasGridLines: true,
      intervalEnabled: true,
    },
    navigator: {
      enabled: true,
    },
    dataLimits: {
      seriesCapacity: 50,
      categoriesCapacity: 100000,
    },
  },
  _dataSourcePermission: 'owner',
  userAuth: {
    dashboards: {
      create: true,
      delete: true,
      move: true,
      rename: true,
      duplicate: true,
      change_owner: true,
      toggle_edit_mode: true,
      edit_layout: true,
      edit_script: true,
      export_dash: true,
      export_jpeg: true,
      export_image: true,
      export_pdf: true,
      share: true,
      restore: true,
      copy_to_server: true,
      import: true,
      select_palette: true,
      replace_datasource: true,
      undo_import_dash: true,
      toggleDataExploration: true,
      filters: {
        create: true,
        delete: true,
        save: true,
        on_off: true,
        toggle_expansion: true,
        modify: true,
        reorder: true,
        modify_type: true,
        toggle_auto_update: true,
        set_defaults: true,
        advanced: true,
        use_starred: true,
        modify_filter_relationship: true,
      },
    },
    widgets: {
      create: true,
      delete: true,
      rename: true,
      duplicate: true,
      copy_to_dashboard: true,
      edit: true,
      edit_script: true,
      change_type: true,
      export_csv: true,
      export_png: true,
      export_svg: true,
      export_pdf: true,
      modify_selection_attrs: true,
      modify_selection_mode: true,
      drill_to_anywhere: true,
      add_to_pulse: true,
      items: {
        create: true,
        delete: true,
        rename: true,
        modify: true,
        reorder: true,
        modify_type: true,
        modify_format: true,
        on_off: true,
        select_hierarchies: true,
      },
      filters: {
        create: true,
        delete: true,
        save: true,
        on_off: true,
        toggle_expansion: true,
        modify: true,
        modify_layout: true,
        modify_type: true,
        modify_dashboard_filters: true,
        use_starred: true,
      },
      widgetViewOnly: false,
    },
    base: {
      isConsumer: false,
      isContributor: false,
      isAdmin: false,
      isSuper: true,
    },
  },
  _toDisableOptionsList: {
    widgets: {
      duplicate: false,
    },
  },
} as WidgetDto;

export const MOCK_WIDGET_CODE_LINE_CHART = `import { ChartWidget } from '@sisense/sdk-ui';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  return (
    <ChartWidget
      title={'REVENUE vs.UNITS SOLD'}
      dataSource={DM.DataSource}
      chartType={'line'}
      dataOptions={ {
        category: [{
            column: DM.Commerce.Date.Months,
            isColored: false,
            sortType: 'sortNone',
          }
        ],
        value: [{
            column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
            color: {
              type: 'uniform',
              color: '#00cee6',
            },
            sortType: 'sortNone',
            numberFormatConfig: {
              decimalScale: 'auto',
              kilo: true,
              million: true,
              billion: true,
              trillion: true,
              thousandSeparator: true,
              prefix: false,
              symbol: undefined,
              name: 'Numbers',
            },
          },{
            column: measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity'),
            color: {
              type: 'uniform',
              color: '#00cee6',
            },
            showOnRightAxis: true,
            sortType: 'sortNone',
            chartType: 'column',
            numberFormatConfig: {
              decimalScale: 'auto',
              kilo: true,
              million: true,
              billion: true,
              trillion: true,
              thousandSeparator: true,
              prefix: false,
              symbol: undefined,
              name: 'Numbers',
            },
          }
        ],
        breakBy: [],
      } }
      filters={ [] }
      styleOptions={ {
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
          showValue: false,
          showPercentage: false,
        },
        markers: {
          enabled: true,
          fill: 'hollow',
          size: 'small',
        },
        xAxis: {
          enabled: true,
          ticks: true,
          labels: {
            enabled: true,
            rotation: 0,
          },
          gridLines: false,
          title: {
            enabled: false,
            text: 'MONTH',
          },
          x2Title: {
            enabled: false,
          },
          intervalEnabled: false,
          min: null,
          max: null,
        },
        yAxis: {
          inactive: false,
          enabled: true,
          ticks: true,
          labels: {
            enabled: true,
            rotation: 0,
          },
          gridLines: true,
          logarithmic: true,
          title: {
            enabled: true,
            text: 'SALES',
          },
          min: null,
          intervalEnabled: false,
          max: null,
        },
        y2Axis: {
          inactive: false,
          enabled: true,
          ticks: true,
          labels: {
            enabled: true,
            rotation: 0,
          },
          gridLines: false,
          logarithmic: false,
          title: {
            enabled: true,
            text: 'QUANTITY',
          },
          templateMainYHasGridLines: true,
          intervalEnabled: true,
          min: null,
          max: null,
        },
        navigator: {
          enabled: true,
          scrollerLocation: undefined,
        },
        dataLimits: {
          seriesCapacity: 50,
          categoriesCapacity: 100000,
        },
        subtype: 'line/spline',
      } }
      drilldownOptions={ {
        drilldownPaths: [],
        drilldownSelections: [],
      } }
    />
  );
}`;

export const MOCK_WIDGET_DTO_PIVOT_TABLE = {
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
                color: '#00cee6',
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
} as WidgetDto;

export const MOCK_WIDGET_CODE_PIVOT_TABLE = `import { PivotTableWidget } from '@sisense/sdk-ui';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  return (
    <PivotTableWidget
      title={'Simple Pivot Table'}
      dataSource={DM.DataSource}
      dataOptions={ {
  rows: [{
      column: DM.Brand.Brand,
      isColored: false,
      sortType: 'sortNone',
    }
  ],
  columns: [{
      column: DM.Commerce.Gender,
      isColored: false,
      sortType: 'sortNone',
      panel: 'columns',
    }
  ],
  values: [{
      column: measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
      color: {
        type: 'uniform',
        color: '#00cee6',
      },
      sortType: 'sortNone',
      numberFormatConfig: {
        decimalScale: 'auto',
        kilo: undefined,
        million: undefined,
        billion: undefined,
        trillion: undefined,
        thousandSeparator: true,
        prefix: false,
        symbol: undefined,
        name: 'Numbers',
      },
    }
  ],
  grandTotals: {
    rows: undefined,
    columns: undefined,
  },
} }
      filters={ [] }
      styleOptions={ {
        rowsPerPage: 25,
        isAutoHeight: true,
        rowHeight: undefined,
        alternatingRowsColor: true,
        alternatingColumnsColor: false,
        headersColor: false,
        membersColor: false,
        totalsColor: false,
      } }
    />
  );
}`;

export const MOCK_WIDGET_DTO_COMPLEX_CHART = {
  title: 'TOP 3 CATEGORIES BY REVENUE AND AGE',
  type: 'chart/bar',
  subtype: 'bar/stacked',
  oid: '66fb233ae2c222003368daca',
  desc: null,
  source: null,
  datasource: {
    address: 'LocalHost',
    title: 'Sample ECommerce',
    id: 'localhost_aSampleIAAaECommerce',
    database: 'aSampleIAAaECommerce',
  },
  selection: null,
  metadata: {
    drillHistory: [
      {
        jaql: {
          table: 'Commerce',
          column: 'Gender',
          dim: '[Commerce.Gender]',
          datatype: 'text',
          merged: true,
          title: 'Gender',
        },
        parent: {
          jaql: {
            table: 'Commerce',
            column: 'Age Range',
            dim: '[Commerce.Age Range]',
            datatype: 'text',
            merged: true,
            title: 'Age Range',
          },
          instanceid: 'C1347-2288-71',
          panel: 'rows',
        },
        through: {
          jaql: {
            datatype: 'text',
            dim: '[Commerce.Age Range]',
            title: 'Age Range',
            column: 'Age Range',
            table: 'Commerce',
            filter: {
              explicit: true,
              multiSelection: true,
              members: ['35-44', '45-54'],
            },
          },
        },
        panel: 'rows',
      },
    ],
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
            instanceid: 'C1347-2288-71',
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
              formula: 'QUARTILE([28B80-CD8], 2)',
              context: {
                '[28B80-CD8]': {
                  table: 'Commerce',
                  column: 'Revenue',
                  dim: '[Commerce.Revenue]',
                  datatype: 'numeric',
                  title: 'Revenue',
                },
              },
              title: 'Revenue Median',
            },
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
            instanceid: '1B15B-F92A-D2',
            panel: 'measures',
          },
        ],
      },
      {
        name: 'break by',
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
            format: {
              members: {},
            },
            instanceid: '68B38-F4BC-B7',
            panel: 'rows',
          },
        ],
      },
      {
        name: 'filters',
        items: [
          {
            jaql: {
              datasource: {
                title: 'Sample ECommerce',
                fullname: 'LocalHost/Sample ECommerce',
                id: 'localhost_aSampleIAAaECommerce',
                address: 'LocalHost',
                database: 'aSampleIAAaECommerce',
              },
              table: 'Category',
              column: 'Category',
              dim: '[Category.Category]',
              datatype: 'text',
              merged: true,
              title: 'Category',
              filter: {
                top: 3,
                by: {
                  table: 'Commerce',
                  column: 'Revenue',
                  dim: '[Commerce.Revenue]',
                  datatype: 'numeric',
                  agg: 'sum',
                  title: 'Total Revenue',
                },
                rankingMessage: 'Total Revenue',
              },
              collapsed: false,
            },
            format: {
              mask: {
                isdefault: true,
              },
            },
            instanceid: '8C8BA-805A-58',
            panel: 'scope',
          },
          {
            jaql: {
              table: 'Category',
              column: 'Category',
              dim: '[Category.Category]',
              datatype: 'text',
              merged: true,
              datasource: {
                address: 'LocalHost',
                title: 'Sample ECommerce',
                id: 'localhost_aSampleIAAaECommerce',
                database: 'aSampleIAAaECommerce',
                fullname: 'localhost/Sample ECommerce',
                live: false,
              },
              firstday: 'mon',
              locale: 'en-us',
              title: 'Category',
              collapsed: false,
              isDashboardFilter: true,
              filter: {
                bottom: 10,
                by: {
                  type: 'measure',
                  formula: 'QUARTILE([AB202-E4C], 2)',
                  context: {
                    '[AB202-E4C]': {
                      table: 'Commerce',
                      column: 'Revenue',
                      dim: '[Commerce.Revenue]',
                      datatype: 'numeric',
                      title: 'Revenue',
                    },
                  },
                  title: 'QUARTILE([Revenue], 2)',
                },
                rankingMessage: 'Median Revenue',
              },
            },
            instanceid: '52B4C-5D69-32',
            panel: 'scope',
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
    ],
    usedFormulasMapping: {},
  },
  dashboardid: '66fb233ae2c222003368dac1',
  options: {
    dashboardFiltersMode: 'filter',
    selector: true,
    triggersDomready: true,
    maxCharsPerLabelXAxis: 9,
    autoUpdateOnEveryChange: true,
    drillToAnywhere: true,
    previousScrollerLocation: {
      min: null,
      max: null,
    },
    aiFeatures: [
      {
        id: 'growth_rate_1572222323562',
        name: 'Growth Rates',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {},
        description:
          'refer to the percentage change of a specific variable within a specific time period and given a certain context',
        isCustomModel: true,
      },
      {
        id: 'summary_statistics_1569425202576',
        name: 'Summary Statistics',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {},
        description: 'Provide information about your data',
        isCustomModel: true,
      },
      {
        id: 'pareto_1569481451806',
        name: 'Pareto',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {},
        description: 'Roughly 80% of the effects come from 20% of the causes',
        isCustomModel: true,
      },
      {
        id: 'percentile_curves_1574252861643',
        name: 'Percentile Curves',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {},
        description: 'Another way to show distributions',
        isCustomModel: true,
      },
      {
        id: 'two-tailed_test_1574241584650',
        name: 'Two-Tailed Test',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {},
        description: 'perform two tailed t-test',
        isCustomModel: true,
      },
      {
        id: 'cluster_1570673124179',
        name: 'Clustering',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {},
        description:
          'Grouping a set of objects in such a way that objects in the same group are more similar to each other than to those in other groups',
        isCustomModel: true,
      },
      {
        id: 'anomaly',
        name: 'Anomaly',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {},
        description: 'Outlier data points detections',
        isCustomModel: false,
      },
      {
        id: 'forecast',
        name: 'What-If Analysis',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {
          hasTargetVar: true,
          targetVar: {
            targetVarPaneActive: false,
            sectionTitle: 'Target Value',
            options: ['Revenue Median'],
            value: 'Revenue Median',
          },
        },
        description:
          'Predict the future values of a 2-var-TS, one of which is the target and the\n                    second is explaining variable.\n                    Provide non-symmetric confidence-interval for the above predictions.\n                    Var-Dependence (Score) - the strength of the influence of the explaining\n                    variable on the target one.\n                    XAI (model weights etc)',
        isCustomModel: false,
      },
      {
        id: 'local_estimates',
        name: 'Local Estimate',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {},
        description:
          'Locally (using before and after time series points) estimating the mean of the time series',
        isCustomModel: false,
      },
      {
        id: 'trend',
        name: 'Trend',
        isEnabled: false,
        isPin: false,
        actions: {},
        options: {},
        description: 'Detect (if exists) Trend-Break-Points and connect those with a trend line',
        isCustomModel: false,
      },
    ],
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
        enabled: true,
        types: {
          count: false,
          percentage: false,
          relative: false,
          totals: false,
        },
        stacked: true,
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
      gridLines: false,
      title: {
        enabled: true,
        text: 'AGE RANGE',
      },
      x2Title: {
        enabled: false,
      },
      intervalEnabled: false,
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
      gridLines: true,
      logarithmic: false,
      title: {
        enabled: true,
        text: 'SALES',
      },
      intervalEnabled: true,
      hideMinMax: false,
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
      gridLines: false,
      logarithmic: false,
      title: {
        enabled: false,
      },
      intervalEnabled: true,
      hideMinMax: false,
      isIntervalEnabled: true,
    },
    dataLimits: {
      seriesCapacity: 50,
      categoriesCapacity: 100000,
    },
    navigator: {
      enabled: true,
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
        {
          id: 'category',
          title: 'Category',
          singular: 'Category',
          plural: 'Category',
        },
      ],
    },
  },
  viewState: {
    activeTab: 'filters',
  },
  drillToDashboardConfig: {
    drilledDashboardPrefix: '_drill',
    drilledDashboardsFolderPrefix: '',
    displayFilterPane: true,
    displayDashboardsPane: true,
    displayToolbarRow: true,
    displayHeaderRow: true,
    volatile: false,
    hideDrilledDashboards: true,
    hideSharedDashboardsForNonOwner: true,
    drillToDashboardMenuCaption: 'Jump to dashboard',
    drillToDashboardRightMenuCaption: 'Jump to ',
    drillToDashboardNavigateType: 1,
    drillToDashboardNavigateTypePivot: 2,
    drillToDashboardNavigateTypeCharts: 1,
    drillToDashboardNavigateTypeOthers: 3,
    excludeFilterDims: [],
    includeFilterDims: [],
    drilledDashboardDisplayType: 2,
    dashboardIds: [],
    modalWindowResize: false,
    showFolderNameOnMenuSelection: false,
    resetDashFiltersAfterJTD: false,
    sameCubeRestriction: true,
    showJTDIcon: true,
    sendPieChartMeasureFiltersOnClick: true,
    forceZeroInsteadNull: false,
    mergeTargetDashboardFilters: false,
    drillToDashboardByName: false,
    sendBreakByValueFilter: true,
    ignoreFiltersSource: false,
  },
  instanceid: 'DABCC-15D6-E8',
  realTimeRefreshing: false,
  wasRendered: false,
} as WidgetDto;

export const MOCK_WIDGET_CODE_COMPLEX_CHART = `import { ChartWidget } from '@sisense/sdk-ui';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  return (
    <ChartWidget
      title={'TOP 3 CATEGORIES BY REVENUE AND AGE'}
      dataSource={DM.DataSource}
      chartType={'bar'}
      dataOptions={ {
        category: [{
            column: DM.Commerce.AgeRange,
            isColored: false,
            sortType: 'sortNone',
          }
        ],
        value: [{
            column: measureFactory.customFormula('Revenue Median', 'QUARTILE([28B80-CD8], 2)', {'28B80-CD8': DM.Commerce.Revenue,}),
            sortType: 'sortNone',
            numberFormatConfig: {
              decimalScale: 'auto',
              kilo: true,
              million: true,
              billion: true,
              trillion: true,
              thousandSeparator: true,
              prefix: false,
              symbol: undefined,
              name: 'Numbers',
            },
          }
        ],
        breakBy: [{
            column: DM.Category.Category,
            isColored: false,
            sortType: 'sortNone',
          }
        ],
        seriesToColorMap: {
        },
      } }
      filters={ [
        filterFactory.topRanking(DM.Category.Category, measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'), 3),
        filterFactory.bottomRanking(DM.Category.Category, measureFactory.customFormula('QUARTILE([Revenue], 2)', 'QUARTILE([AB202-E4C], 2)', {'AB202-E4C': DM.Commerce.Revenue,}), 10)
        ] }
      styleOptions={ {
        legend: {
          enabled: true,
          position: 'bottom',
        },
        seriesLabels: {
          enabled: false,
          rotation: 0,
          showValue: false,
          showPercentage: false,
        },
        xAxis: {
          enabled: true,
          ticks: true,
          labels: {
            enabled: true,
            rotation: 0,
          },
          gridLines: false,
          title: {
            enabled: true,
            text: 'AGE RANGE',
          },
          x2Title: {
            enabled: false,
          },
          intervalEnabled: false,
          isIntervalEnabled: false,
          min: null,
          max: null,
        },
        yAxis: {
          inactive: false,
          enabled: true,
          ticks: true,
          labels: {
            enabled: true,
            rotation: 0,
          },
          gridLines: true,
          logarithmic: false,
          title: {
            enabled: true,
            text: 'SALES',
          },
          intervalEnabled: true,
          hideMinMax: false,
          isIntervalEnabled: true,
          min: null,
          max: null,
        },
        y2Axis: {
          inactive: true,
          enabled: true,
          ticks: true,
          labels: {
            enabled: true,
            rotation: 0,
          },
          gridLines: false,
          logarithmic: false,
          title: {
            enabled: false,
          },
          intervalEnabled: true,
          hideMinMax: false,
          isIntervalEnabled: true,
          min: null,
          max: null,
        },
        dataLimits: {
          seriesCapacity: 50,
          categoriesCapacity: 100000,
        },
        navigator: {
          enabled: true,
          scrollerLocation: undefined,
        },
        narration: {
          enabled: false,
          display: 'above',
          format: 'bullets',
          verbosity: 'medium',
          up_sentiment: 'good',
          aggregation: 'sum',
          labels: [{
              id: 'age_range',
              title: 'Age Range',
              singular: 'Age Range',
              plural: 'Age Range',
            },{
              id: 'category',
              title: 'Category',
              singular: 'Category',
              plural: 'Category',
            }
          ],
        },
        subtype: 'bar/stacked',
        lineWidth: undefined,
        markers: undefined,
      } }
      drilldownOptions={ {
        drilldownPaths: [],
        drilldownSelections: [],
      } }
    />
  );
}`;
