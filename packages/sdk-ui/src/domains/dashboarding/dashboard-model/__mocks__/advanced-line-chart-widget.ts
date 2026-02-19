import { WidgetDto } from '@/domains/widgets/components/widget-by-id/types';

/**
 * Line chart widget DTO with advanced analytics (e.g. trend, forecast).
 */
export const advancedLineChartWidgetDto = {
  title: 'Total of Revenue - total of Cost by months in Date',
  type: 'chart/line',
  subtype: 'line/spline',
  desc: '',
  datasource: {
    address: 'LocalHost',
    title: 'Sample ECommerce',
    id: 'localhost_aSampleIAAaECommerce',
    live: false,
    lastBuildTime: '2025-03-27T14:17:42.257Z',
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
      gridLines: false,
      logarithmic: false,
      isIntervalEnabled: true,
      templateMainYHasGridLines: true,
    },
    navigator: {
      enabled: true,
    },
    dataLimits: {
      seriesCapacity: 50,
      categoriesCapacity: 100000,
    },
    narration: {
      display: 'above',
      verbosity: 'low',
      labels: [
        {
          id: 'months_in_date',
          title: 'months in Date',
          singular: 'months in Date',
          plural: 'months in Date',
        },
      ],
    },
  },
  instanceid: '155A3-F652-14',
  realTimeRefreshing: false,
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
              title: 'months in Date',
              dim: '[Commerce.Date]',
              datatype: 'datetime',
              level: 'months',
            },
            instanceid: 'E1C7A-2647-40',
            panel: 'rows',
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
            hierarchies: ['calendar', 'calendar - weeks'],
          },
        ],
      },
      {
        name: 'values',
        items: [
          {
            jaql: {
              title: 'total of Revenue - total of Cost',
              formula: 'sum([12fa]) - sum([c1bb])',
              context: {
                '[12fa]': {
                  title: 'Revenue',
                  dim: '[Commerce.Revenue]',
                  datatype: 'numeric',
                },
                '[c1bb]': {
                  title: 'Cost',
                  dim: '[Commerce.Cost]',
                  datatype: 'numeric',
                },
              },
            },
            instanceid: 'D4056-8BBE-A1',
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
                type: 'color',
                color: '#d39a47',
                isHandPickedColor: true,
              },
            },
            statisticalModels: {
              trend: {
                isEnabled: true,
                isViewerDisabled: false,
                trendType: 'linear',
                ignoreAnomalies: false,
                trendOnForecast: false,
                compare: {
                  isEnabled: false,
                  period: 'year',
                },
                isAccessible: true,
              },
              forecast: {
                isEnabled: true,
                isViewerDisabled: false,
                explainVariable: null,
                evaluation: {
                  type: 'all',
                  numLastPointsForEvaluation: 0,
                  ignoreLast: 0,
                },
                forecastPeriod: 6,
                confidence: 80,
                modelType: 'en',
                boundaries: {
                  upper: {
                    isEnabled: false,
                    value: null,
                  },
                  lower: {
                    isEnabled: false,
                    value: null,
                  },
                  isInt: {
                    isEnabled: false,
                  },
                },
                isAccessible: true,
              },
            },
          },
          {
            jaql: {
              table: 'Commerce',
              column: 'Revenue',
              dim: '[Commerce.Revenue]',
              datatype: 'numeric',
              columnTitle: 'Revenue',
              tableTitle: 'Commerce',
              agg: 'sum',
              title: 'Total Revenue',
            },
            instanceid: 'DA977-EB29-8B',
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
                type: 'color',
                color: '#26a0a2',
                isHandPickedColor: true,
              },
            },
            statisticalModels: {
              forecast: {
                isEnabled: true,
                isViewerDisabled: false,
                explainVariable: null,
                evaluation: {
                  type: 'all',
                  numLastPointsForEvaluation: 0,
                  ignoreLast: 0,
                },
                forecastPeriod: 6,
                confidence: 80,
                modelType: 'en',
                boundaries: {
                  upper: {
                    isEnabled: false,
                    value: null,
                  },
                  lower: {
                    isEnabled: false,
                    value: null,
                  },
                  isInt: {
                    isEnabled: false,
                  },
                },
                isAccessible: true,
              },
              trend: {
                isEnabled: true,
                isViewerDisabled: false,
                trendType: 'linear',
                ignoreAnomalies: false,
                trendOnForecast: false,
                compare: {
                  isEnabled: false,
                  period: 'year',
                },
                isAccessible: true,
              },
            },
            y2: true,
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
} as unknown as WidgetDto;
