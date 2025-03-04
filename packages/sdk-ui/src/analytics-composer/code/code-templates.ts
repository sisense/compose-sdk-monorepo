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
    />
  );
}`,
    chartTmpl: `{{baseChartTmpl}}`,
    chartWidgetTmpl: `{{baseChartTmpl}}`,
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
    />
  );
}`,
  },
  angular: {
    baseChartTmpl: `import { Component } from '@angular/core';
import { SdkUiModule, type ChartDataOptions } from '@sisense/sdk-ui-angular';
{{extraImportsString}}
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

@Component({
    selector: 'code-example',
    imports: [SdkUiModule],
    template: \`
      <csdk-chart-widget
        chartType='{{chartTypeString}}'
        [dataSource]='DM.DataSource'
        [dataOptions]='dataOptions'
        [filters]='filters'
      />
    \`
})
export class CodeExample {
    DM = DM;
    dataOptions: ChartDataOptions = {{dataOptionsString}};
    filters = {{filtersString}};
}`,
    chartTmpl: `{{baseChartTmpl}}`,
    chartWidgetTmpl: `{{baseChartTmpl}}`,
    widgetByIdTmpl: `import { Component } from '@angular/core';
import { SdkUiModule } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'code-example',
  imports: [SdkUiModule],
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
import { CommonModule } from '@angular/common';
import { QueryService } from '@sisense/sdk-ui-angular';
import { type QueryResultData } from '@sisense/sdk-data';

@Component({
  selector: 'code-example',
  imports: [CommonModule],
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
import { CommonModule } from '@angular/common';
{{extraImportsString}}
import { type QueryResultData } from '@sisense/sdk-data';
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli
import { QueryService } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'code-example',
  imports: [CommonModule],
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
  },
  vue: {
    baseChartTmpl: `<script setup lang="ts">
  import { ref } from 'vue';
  import { {{componentString}} } from '@sisense/sdk-ui-vue';
  {{extraImportsString}}
  import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

  const dataOptions = ref({{dataOptionsString}});
  const filters = ref({{filtersString}});
</script>

<template>
  <{{componentString}}
    chartType="{{chartTypeString}}"
    :dataOptions="dataOptions"
    :filters="filters"
    :dataSource="DM.DataSource"
    title="{{titleString}}" />
</template>`,
    chartTmpl: `{{baseChartTmpl}}`,
    chartWidgetTmpl: `{{baseChartTmpl}}`,
    widgetByIdTmpl: `<script setup lang="ts">
import { WidgetById } from '@sisense/sdk-ui-vue';
</script>
<template>
  <WidgetById
    :widgetOid="{{widgetOid}}"
    :dashboardOid="{{dashboardOid}}"
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
  },
};
