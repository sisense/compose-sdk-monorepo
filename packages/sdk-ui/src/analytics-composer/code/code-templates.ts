import { CodeTemplates } from '../types.js';

/**
 * Code templates for different UI frameworks.
 *
 * A code template is made up of other code templates and placeholders.
 * This allows a code template to be reused in other code templates.
 * For example, a chart widget template can be reused in a dashboard template.
 *
 * @internal
 */
export const CODE_TEMPLATES: CodeTemplates = {
  react: {
    baseChartTmpl: `import { {{componentString}} } from '@sisense/sdk-ui';
{{extraImportsString}}
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  return (
    <{{componentString}}
      title={'{{titleString}}'}
      dataSource={DM.DataSource}
      chartType={'{{chartTypeString}}'}
      dataOptions={ {{dataOptionsString}} }
      filters={ {{filtersString}} }
      styleOptions={ {{styleOptionsString}} }
      drilldownOptions={ {{drilldownOptionsString}} }
    />
  );
}`,
    chartTmpl: `{{baseChartTmpl}}`,
    chartWidgetTmpl: `{{baseChartTmpl}}`,
    chartWidgetPropsTmpl: `
    {
      id: '{{idString}}',
      widgetType: '{{widgetTypeString}}',
      title: '{{titleString}}',
      dataSource: DM.DataSource,
      chartType: '{{chartTypeString}}',
      dataOptions: {{dataOptionsString}},
      filters: {{filtersString}},
      styleOptions: {{styleOptionsString}},
      drilldownOptions: {{drilldownOptionsString}},
    }`,
    widgetByIdTmpl: `import { WidgetById } from '@sisense/sdk-ui';

const CodeExample = () => {
    return (
      <>
        <WidgetById
          widgetOid="{{widgetOid}}"
          dashboardOid="{{dashboardOid}}"
          includeDashboardFilters={true}
        />
      </>
    );
};

export default CodeExample;
`,
    executeQueryByWidgetIdTmpl: `import { useExecuteQueryByWidgetId } from '@sisense/sdk-ui';

const CodeExample = () => {
  const { data, isLoading, isError, error } = useExecuteQueryByWidgetId({
    widgetOid: "{{widgetOid}}",
    dashboardOid: "{{dashboardOid}}"
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
`,
    executeQueryTmpl: `import { useExecuteQuery } from '@sisense/sdk-ui';
{{extraImportsString}}
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

const CodeExample = () => {
  const queryProps = {
    dataSource: DM.DataSource,
    dimensions: {{dimensionsString}},
    measures: {{measuresString}},
    filters: {{filtersString}},
    highlights: {{highlightsString}},
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
`,
    executePivotQueryTmpl: `import { useExecutePivotQuery, ExecutePivotQueryParams } from '@sisense/sdk-ui';
{{extraImportsString}}
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

const CodeExample = () => {
    const pivotQueryProps: ExecutePivotQueryParams = {
      dataSource: DM.DataSource,
      rows: {{rowsString}},
      values: {{valuesString}},
      filters: {{filtersString}},
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
`,
    pivotTableWidgetTmpl: `import { {{componentString}} } from '@sisense/sdk-ui';
{{extraImportsString}}
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  return (
    <{{componentString}}
      title={'{{titleString}}'}
      dataSource={DM.DataSource}
      dataOptions={ {{dataOptionsString}} }
      filters={ {{filtersString}} }
      styleOptions={ {{styleOptionsString}} }
    />
  );
}`,
    pivotTableWidgetPropsTmpl: `{
      id: '{{idString}}',
      widgetType: '{{widgetTypeString}}',
      title: '{{titleString}}',
      dataSource: DM.DataSource,
      dataOptions: {{dataOptionsString}},
      filters: {{filtersString}},
      styleOptions: {{styleOptionsString}},
    }`,
    dashboardByIdTmpl: `import { DashboardById } from '@sisense/sdk-ui';

const CodeExample = () => {
  return (
    <>
      <DashboardById dashboardOid="{{dashboardOid}}" />
    </>
  );
};

export default CodeExample;`,
    dashboardTmpl: `import { useMemo } from 'react';
import { Dashboard, DashboardProps, WidgetProps } from '@sisense/sdk-ui';
import { Filter, FilterRelations } from '@sisense/sdk-data';
{{extraImportsString}}
import * as DM from './{{defaultDataSourceString}}'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  const dashboardProps: DashboardProps = useMemo(() => {
    const widgets: WidgetProps[] = {{widgetsString}};
    const filters: Filter[] | FilterRelations = {{filtersString}};

    return {
      title: '{{titleString}}',
      widgets,
      filters,
      config: {
        toolbar: { isVisible: true },
        filtersPanel: { isVisible: true },
      },
      widgetsOptions: {{widgetsOptionsString}},
      layoutOptions: {{layoutOptionsString}},
      tabbersOptions: {{tabbersOptionsString}},
      styleOptions: {{styleOptionsString}},
    };
  }, []);

  return (
    <Dashboard {...dashboardProps} />
  );
}`,
  },
  angular: {
    baseChartTmpl: `import { Component } from '@angular/core';
import { type ChartDataOptions, type ChartStyleOptions } from '@sisense/sdk-ui-angular';
{{extraImportsString}}
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

@Component({
    selector: 'code-example',
    template: \`
      <csdk-chart-widget
        [title]="'{{titleString}}'"
        chartType='{{chartTypeString}}'
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
    dataOptions: ChartDataOptions = {{dataOptionsString}};
    filters = {{filtersString}};
    styleOptions: ChartStyleOptions = {{styleOptionsString}};
    drilldownOptions = {{drilldownOptionsString}};
}`,
    chartTmpl: `{{baseChartTmpl}}`,
    chartWidgetTmpl: `{{baseChartTmpl}}`,
    chartWidgetPropsTmpl: `{
      id: '{{idString}}',
      widgetType: '{{widgetTypeString}}',
      title: '{{titleString}}',
      dataSource: DM.DataSource,
      chartType: '{{chartTypeString}}',
      dataOptions: {{dataOptionsString}},
      filters: {{filtersString}},
      styleOptions: {{styleOptionsString}},
      drilldownOptions: {{drilldownOptionsString}},
    }`,
    widgetByIdTmpl: `import { Component } from '@angular/core';

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
  widgetOid = "{{widgetOid}}";
  dashboardOid = "{{dashboardOid}}";
  includeDashboardFilters = true;
}`,
    executeQueryByWidgetIdTmpl: `import { Component } from '@angular/core';
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
          widgetOid: "{{widgetOid}}",
          dashboardOid: "{{dashboardOid}}",
        });
        this.queryResult = data as QueryResultData;
      } catch(error: unknown) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
        }
      }
    }
}
`,
    executeQueryTmpl: `import { Component } from '@angular/core';
{{extraImportsString}}
import { type QueryResultData } from '@sisense/sdk-data';
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli
import { QueryService } from '@sisense/sdk-ui-angular';

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
      const queryProps = {
        dataSource: DM.DataSource,
        dimensions: {{dimensionsString}},
        measures: {{measuresString}},
        filters: {{filtersString}},
        highlights: {{highlightsString}},
      }

      try {
        const { data } = await this.queryService.executeQuery(queryProps);
        this.queryResult = data as QueryResultData;
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
        }
      }
    }
}
`,
    executePivotQueryTmpl: `Not implemented yet`,
    pivotTableWidgetTmpl: `Not implemented yet`,
    pivotTableWidgetPropsTmpl: `{
      id: '{{idString}}',
      widgetType: '{{widgetTypeString}}',
      title: '{{titleString}}',
      dataSource: DM.DataSource,
      dataOptions: {{dataOptionsString}},
      filters: {{filtersString}},
      styleOptions: {{styleOptionsString}},
    }`,
    dashboardByIdTmpl: `import { Component } from '@angular/core';

@Component({
  selector: 'code-example',
  template: \`
    <csdk-dashboard-by-id
      [dashboardOid]="dashboardOid"
    />
  \`,
})

export class CodeExample {
  dashboardOid = "{{dashboardOid}}";
}`,
    dashboardTmpl: `/** COMING SOON */`,
  },
  vue: {
    baseChartTmpl: `<script setup lang="ts">
  import { ref } from 'vue';
  import { {{componentString}}, type ChartStyleOptions } from '@sisense/sdk-ui-vue';
  {{extraImportsString}}
  import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

  const dataOptions = ref({{dataOptionsString}});
  const filters = ref({{filtersString}});
  const styleOptions = ref<ChartStyleOptions>({{styleOptionsString}});
  const drilldownOptions = ref({{drilldownOptionsString}});
</script>

<template>
  <{{componentString}}
    chartType="{{chartTypeString}}"
    :dataOptions="dataOptions"
    :filters="filters"
    :styleOptions="styleOptions"
    :drilldownOptions="drilldownOptions"
    :dataSource="DM.DataSource"
    title="{{titleString}}" />
</template>`,
    chartTmpl: `{{baseChartTmpl}}`,
    chartWidgetTmpl: `{{baseChartTmpl}}`,
    chartWidgetPropsTmpl: `{
      id: '{{idString}}',
      widgetType: '{{widgetTypeString}}',
      title: '{{titleString}}',
      dataSource: DM.DataSource,
      chartType: '{{chartTypeString}}',
      dataOptions: {{dataOptionsString}},
      filters: {{filtersString}},
      styleOptions: {{styleOptionsString}},
      drilldownOptions: {{drilldownOptionsString}},
    }`,
    widgetByIdTmpl: `<script setup lang="ts">
import { WidgetById } from '@sisense/sdk-ui-vue';
</script>
<template>
  <WidgetById
    :widgetOid="'{{widgetOid}}'"
    :dashboardOid="'{{dashboardOid}}'"
  />
</template>
`,
    executeQueryByWidgetIdTmpl: `<script setup lang="ts">
import { useExecuteQueryByWidgetId } from '@sisense/sdk-ui-vue';

const { data, isLoading, isError, error } = useExecuteQueryByWidgetId({
  widgetOid: "{{widgetOid}}",
  dashboardOid: "{{dashboardOid}}"
});
</script>
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isError">Error: {{error.message}}</div>
    <div v-else-if="data">Total Rows: {{data.rows.length}}</div>
  </div>
</template>
`,
    executeQueryTmpl: `<script setup lang="ts">
import { useExecuteQuery } from '@sisense/sdk-ui-vue';
{{extraImportsString}}
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

const queryProps = {
  dataSource: DM.DataSource,
  dimensions: {{dimensionsString}},
  measures: {{measuresString}},
  filters: {{filtersString}},
  highlights: {{highlightsString}},
}
const { data, isLoading, isError, error } = useExecuteQuery(queryProps);
</script>
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isError">Error: {{error.message}}</div>
    <div v-else-if="data">Total Rows: {{data.rows.length}}</div>
  </div>
</template>`,
    executePivotQueryTmpl: 'Not implemented yet',
    pivotTableWidgetTmpl: `Not implemented yet`,
    pivotTableWidgetPropsTmpl: `{
      id: '{{idString}}',
      widgetType: '{{widgetTypeString}}',
      title: '{{titleString}}',
      dataSource: DM.DataSource,
      dataOptions: {{dataOptionsString}},
      filters: {{filtersString}},
      styleOptions: {{styleOptionsString}},
    }`,
    dashboardByIdTmpl: `<script setup lang="ts">
import { DashboardById } from '@sisense/sdk-ui-vue';
</script>
<template>
  <DashboardById :dashboardOid="'{{dashboardOid}}'" />
</template>`,
    dashboardTmpl: `/** COMING SOON */`,
  },
};
