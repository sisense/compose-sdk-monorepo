export const MOCK_CODE_REACT_1 = `import { ChartWidget } from '@sisense/sdk-ui';
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
        subtype: 'line/spline',
        legend: {
          enabled: true,
          position: 'bottom',
        },
        xAxis: {
          enabled: true,
          gridLines: false,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          min: undefined,
          max: undefined,
          logarithmic: undefined,
          title: {
            enabled: false,
            text: 'MONTH',
          },
          labels: {
            enabled: true,
          },
        },
        yAxis: {
          enabled: true,
          gridLines: true,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          min: undefined,
          max: undefined,
          logarithmic: true,
          title: {
            enabled: true,
            text: 'SALES',
          },
          labels: {
            enabled: true,
          },
        },
        y2Axis: {
          enabled: true,
          gridLines: false,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          min: undefined,
          max: undefined,
          logarithmic: false,
          title: {
            enabled: true,
            text: 'QUANTITY',
          },
          labels: {
            enabled: true,
          },
        },
        seriesLabels: {
          enabled: false,
          rotation: 0,
          showValue: false,
          showPercentage: false,
        },
        dataLimits: {
          seriesCapacity: 50,
          categoriesCapacity: 100000,
        },
        navigator: {
          enabled: true,
        },
        lineWidth: {
          width: 'bold',
        },
        markers: {
          enabled: true,
          size: 'small',
          fill: 'hollow',
        },
      } }
      drilldownOptions={ {
        drilldownPaths: [],
        drilldownSelections: [],
      } }
    />
  );
}`;

export const MOCK_CODE_ANGULAR_1 = `import { Component } from '@angular/core';
import { type ChartDataOptions, type ChartStyleOptions } from '@sisense/sdk-ui-angular';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

@Component({
    selector: 'code-example',
    template: \`
      <csdk-chart-widget
        [title]="'REVENUE vs.UNITS SOLD'"
        chartType='line'
        [dataSource]='DM.DataSource'
        [dataOptions]='dataOptions'
        [filters]='filters'
        [styleOptions]='styleOptions'
        [drilldownOptions]='drilldownOptions'
      />
    \`
})
export class CodeExample {
    DM = DM;
    dataOptions: ChartDataOptions = {
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
      };
    filters = [];
    styleOptions: ChartStyleOptions = {
        subtype: 'line/spline',
        legend: {
          enabled: true,
          position: 'bottom',
        },
        xAxis: {
          enabled: true,
          gridLines: false,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          min: undefined,
          max: undefined,
          logarithmic: undefined,
          title: {
            enabled: false,
            text: 'MONTH',
          },
          labels: {
            enabled: true,
          },
        },
        yAxis: {
          enabled: true,
          gridLines: true,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          min: undefined,
          max: undefined,
          logarithmic: true,
          title: {
            enabled: true,
            text: 'SALES',
          },
          labels: {
            enabled: true,
          },
        },
        y2Axis: {
          enabled: true,
          gridLines: false,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          min: undefined,
          max: undefined,
          logarithmic: false,
          title: {
            enabled: true,
            text: 'QUANTITY',
          },
          labels: {
            enabled: true,
          },
        },
        seriesLabels: {
          enabled: false,
          rotation: 0,
          showValue: false,
          showPercentage: false,
        },
        dataLimits: {
          seriesCapacity: 50,
          categoriesCapacity: 100000,
        },
        navigator: {
          enabled: true,
        },
        lineWidth: {
          width: 'bold',
        },
        markers: {
          enabled: true,
          size: 'small',
          fill: 'hollow',
        },
      };
    drilldownOptions = {
        drilldownPaths: [],
        drilldownSelections: [],
      };
}`;

export const MOCK_CODE_VUE_1 = `<script setup lang="ts">
  import { ref } from 'vue';
  import { ChartWidget, type ChartStyleOptions } from '@sisense/sdk-ui-vue';
  import { measureFactory } from '@sisense/sdk-data';
  import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

  const dataOptions = ref({
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
      });
  const filters = ref([]);
  const styleOptions = ref<ChartStyleOptions>({
        subtype: 'line/spline',
        legend: {
          enabled: true,
          position: 'bottom',
        },
        xAxis: {
          enabled: true,
          gridLines: false,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          min: undefined,
          max: undefined,
          logarithmic: undefined,
          title: {
            enabled: false,
            text: 'MONTH',
          },
          labels: {
            enabled: true,
          },
        },
        yAxis: {
          enabled: true,
          gridLines: true,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          min: undefined,
          max: undefined,
          logarithmic: true,
          title: {
            enabled: true,
            text: 'SALES',
          },
          labels: {
            enabled: true,
          },
        },
        y2Axis: {
          enabled: true,
          gridLines: false,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          min: undefined,
          max: undefined,
          logarithmic: false,
          title: {
            enabled: true,
            text: 'QUANTITY',
          },
          labels: {
            enabled: true,
          },
        },
        seriesLabels: {
          enabled: false,
          rotation: 0,
          showValue: false,
          showPercentage: false,
        },
        dataLimits: {
          seriesCapacity: 50,
          categoriesCapacity: 100000,
        },
        navigator: {
          enabled: true,
        },
        lineWidth: {
          width: 'bold',
        },
        markers: {
          enabled: true,
          size: 'small',
          fill: 'hollow',
        },
      });
  const drilldownOptions = ref({
        drilldownPaths: [],
        drilldownSelections: [],
      });
</script>

<template>
  <ChartWidget
    chartType="line"
    :dataOptions="dataOptions"
    :filters="filters"
    :styleOptions="styleOptions"
    :drilldownOptions="drilldownOptions"
    :dataSource="DM.DataSource"
    title="REVENUE vs.UNITS SOLD" />
</template>`;

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

export const MOCK_CODE_REACT_2 = `import { ChartWidget } from '@sisense/sdk-ui';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  return (
    <ChartWidget
      title={'table chart of total of revenue by condition'}
      dataSource={DM.DataSource}
      chartType={'table'}
      dataOptions={ {
    columns: [
      DM.Commerce.Condition,
      {column: measureFactory.sum(DM.Commerce.Revenue, 'total of Revenue'), sortType: 'sortDesc'}
    ],
  } }
      filters={ [
    filterFactory.members(DM.Country.Country, ['Cambodia', 'United States']),
    filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
    filterFactory.greaterThan(DM.Commerce.Revenue, 1000)
    ] }
    />
  );
}`;

export const MOCK_CODE_REACT_3 = `import { WidgetById } from '@sisense/sdk-ui';

const CodeExample = () => {
    return (
      <>
        <WidgetById
          widgetOid="SOME_WIDGET_BY_ID"
          dashboardOid="SOME_DASHBOARD_OID"
          includeDashboardFilters={true}
        />
      </>
    );
};

export default CodeExample;
`;

export const MOCK_CODE_ANGULAR_2 = `import { Component } from '@angular/core';

@Component({
  selector: 'code-example',
  template: \`
    <csdk-widget-by-id
      [widgetOid]="widgetOid"
      [dashboardOid]="dashboardOid"
      [includeDashboardFilters]="includeDashboardFilters"
    />
  \`,
})

export class CodeExample {
  widgetOid = "SOME_WIDGET_BY_ID";
  dashboardOid = "SOME_DASHBOARD_OID";
  includeDashboardFilters = true;
}`;

export const MOCK_CODE_VUE_2 = `<script setup lang="ts">
import { WidgetById } from '@sisense/sdk-ui-vue';
</script>
<template>
  <WidgetById
    :widgetOid="'SOME_WIDGET_BY_ID'"
    :dashboardOid="'SOME_DASHBOARD_OID'"
  />
</template>
`;

export const MOCK_CODE_EXECUTE_QUERY_REACT_1 = `import { useExecuteQueryByWidgetId } from '@sisense/sdk-ui';

const CodeExample = () => {
  const { data, isLoading, isError, error } = useExecuteQueryByWidgetId({
    widgetOid: "SOME_WIDGET_BY_ID",
    dashboardOid: "SOME_DASHBOARD_OID"
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  if (data) {
    return <div>Total Rows: {data.rows.length}</div>;
  }

  return null;
};

export default CodeExample;
`;

export const MOCK_CODE_EXECUTE_QUERY_ANGULAR_1 = `import { Component } from '@angular/core';
import { QueryService } from '@sisense/sdk-ui-angular';
import { type QueryResultData } from '@sisense/sdk-data';

@Component({
  selector: 'code-example',
  template: \`<div>
    <div *ngIf="errorMessage">Error: {{ errorMessage }}</div>
    <div *ngIf="!errorMessage">Total Rows: {{ queryResult.rows.length }}</div>
  </div>\`,
})

export class CodeExample {
    queryResult: QueryResultData = { rows: [], columns: [] };

    errorMessage: string | null = null;

    constructor(private queryService: QueryService) {}

    async ngOnInit(): Promise<void> {
      try {
        const { data } = await this.queryService.executeQueryByWidgetId({
          widgetOid: "SOME_WIDGET_BY_ID",
          dashboardOid: "SOME_DASHBOARD_OID",
        });
        this.queryResult = data as QueryResultData;
      } catch(error: unknown) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
        }
      }
    }
}
`;

export const MOCK_CODE_EXECUTE_QUERY_VUE_1 = `<script setup lang="ts">
import { useExecuteQueryByWidgetId } from '@sisense/sdk-ui-vue';

const { data, isLoading, isError, error } = useExecuteQueryByWidgetId({
  widgetOid: "SOME_WIDGET_BY_ID",
  dashboardOid: "SOME_DASHBOARD_OID"
});
</script>
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isError">Error: {{error.message}}</div>
    <div v-else-if="data">Total Rows: {{data.rows.length}}</div>
  </div>
</template>
`;

export const MOCK_CODE_EXECUTE_QUERY_REACT_2 = `import { useExecuteQuery } from '@sisense/sdk-ui';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

const CodeExample = () => {
  const queryProps = {
    dataSource: DM.DataSource,
    dimensions: [],
    measures: [],
    filters: [],
    highlights: [],
  }

  const { data, isLoading, isError, error } = useExecuteQuery(queryProps);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  if (data) {
    return <div>Total Rows: {data.rows.length}</div>;
  }

  return null;
};

export default CodeExample;
`;

export const MOCK_CODE_EXECUTE_PIVOT_QUERY_REACT_1 = `import { useExecutePivotQuery, ExecutePivotQueryParams } from '@sisense/sdk-ui';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

const CodeExample = () => {
    const pivotQueryProps: ExecutePivotQueryParams = {
      dataSource: DM.DataSource,
      rows: [],
      values: [],
      filters: [],
    }

    const { data, isLoading, isError, error } = useExecutePivotQuery(pivotQueryProps);

    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (isError) {
      return <div>Error: {error.message}</div>;
    }
    if (data) {
      return <div>Total Rows: {data.table.rows.length}</div>;
    }

    return null;
};

export default CodeExample;
`;

export const MOCK_CODE_REACT_LINE_WITHOUT_DEFAULT_PROPS = `import { ChartWidget } from '@sisense/sdk-ui';
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
      } }
      filters={ [] }
      styleOptions={ {
        subtype: 'line/spline',
        xAxis: {
          gridLines: false,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          title: {
            text: 'MONTH',
          },
        },
        yAxis: {
          enabled: true,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          logarithmic: true,
          title: {
            enabled: true,
            text: 'SALES',
          },
        },
        y2Axis: {
          isIntervalEnabled: undefined,
          title: {
            enabled: true,
            text: 'QUANTITY',
          },
        },
        markers: {
          enabled: true,
          fill: 'hollow',
        },
      } }
      drilldownOptions={ {
        drilldownPaths: [],
        drilldownSelections: [],
      } }
    />
  );
}`;

export const MOCK_CODE_VUE_LINE_WITHOUT_DEFAULT_PROPS = `<script setup lang="ts">
  import { ref } from 'vue';
  import { ChartWidget, type ChartStyleOptions } from '@sisense/sdk-ui-vue';
  import { measureFactory } from '@sisense/sdk-data';
  import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

  const dataOptions = ref({
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
      });
  const filters = ref([]);
  const styleOptions = ref<ChartStyleOptions>({
        subtype: 'line/spline',
        xAxis: {
          gridLines: false,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          title: {
            text: 'MONTH',
          },
        },
        yAxis: {
          enabled: true,
          intervalJumps: undefined,
          isIntervalEnabled: undefined,
          logarithmic: true,
          title: {
            enabled: true,
            text: 'SALES',
          },
        },
        y2Axis: {
          isIntervalEnabled: undefined,
          title: {
            enabled: true,
            text: 'QUANTITY',
          },
        },
        markers: {
          enabled: true,
          fill: 'hollow',
        },
      });
  const drilldownOptions = ref({
        drilldownPaths: [],
        drilldownSelections: [],
      });
</script>

<template>
  <ChartWidget
    chartType="line"
    :dataOptions="dataOptions"
    :filters="filters"
    :styleOptions="styleOptions"
    :drilldownOptions="drilldownOptions"
    :dataSource="DM.DataSource"
    title="REVENUE vs.UNITS SOLD" />
</template>`;

export const MOCK_CODE_REACT_INDICATOR_WITHOUT_DEFAULT_PROPS = `import { ChartWidget } from '@sisense/sdk-ui';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  return (
    <ChartWidget
      title={'TOTAL REVENUE'}
      dataSource={DM.DataSource}
      chartType={'indicator'}
      dataOptions={ {
        value: [{
            column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
            color: {
              type: 'uniform',
              color: '#00cee6',
              colorIndex: 0,
            },
            sortType: 'sortNone',
            numberFormatConfig: {
              decimalScale: 'auto',
              kilo: false,
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
        secondary: [],
        min: [{
            column: measureFactory.customFormula('0 (default)', '0'),
            sortType: 'sortNone',
          }
        ],
        max: [{
            column: measureFactory.customFormula('125000000', '125000000'),
            sortType: 'sortNone',
            numberFormatConfig: {
              decimalScale: 'auto',
              kilo: false,
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
      } }
      filters={ [] }
      styleOptions={ {
        subtype: 'indicator/gauge',
        skin: 1,
        indicatorComponents: {
          title: {
            shouldBeShown: false,
            text: 'Total Revenue',
          },
          ticks: {
            shouldBeShown: true,
          },
          labels: {
            shouldBeShown: true,
          },
        },
      } }
      drilldownOptions={ {
        drilldownPaths: [],
        drilldownSelections: [],
      } }
    />
  );
}`;

export const MOCK_CODE_REACT_PIVOT_WITHOUT_DEFAULT_PROPS = `import { PivotTableWidget } from '@sisense/sdk-ui';
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
        rowHeight: undefined,
        imageColumns: undefined,
        highlightClickableCells: false,
      } }
    />
  );
}`;
