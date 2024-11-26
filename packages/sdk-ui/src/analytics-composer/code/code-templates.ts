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
  const { data, isLoading, isError } = useExecuteQueryByWidgetId({
    widgetOid: "{{widgetOid}}",
    dashboardOid: "{{dashboardOid}}"
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (data) {
    return <div>Total Rows: {data.rows.length}</div>;
  }

  return null;
};

export default CodeExample;
`,
    executeQueryWidgetTmpl: `import { useExecuteQuery } from '@sisense/sdk-ui';
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

  const { data, isLoading, isError } = useExecuteQuery(queryProps);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (data) {
    return <div>Total Rows: {data.rows.length}</div>;
  }

  return null;
};

export default CodeExample;
`,
  },
  angular: {
    baseChartTmpl: `import { Component } from '@angular/core';
{{extraImportsString}}
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli

@Component({
    selector: 'code-example',
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
    dataOptions = {{dataOptionsString}};
    filters = {{filtersString}};
}`,
    chartTmpl: `{{baseChartTmpl}}`,
    chartWidgetTmpl: `{{baseChartTmpl}}`,
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
  template: '<div>Total Rows: {{ queryResult.rows.length }}</div>',
})

export class CodeExample {
    queryResult: QueryResultData = { rows: [], columns: [] };

    constructor(private queryService: QueryService) {}

    async ngOnInit(): Promise<void> {
      const { data } = await this.queryService.executeQueryByWidgetId({
        widgetOid: "{{widgetOid}}",
        dashboardOid: "{{dashboardOid}}",
      });
      this.queryResult = data as QueryResultData;
    }
}
`,
    executeQueryWidgetTmpl: `import { Component } from '@angular/core';
{{extraImportsString}}
import { type QueryResultData } from '@sisense/sdk-data';
import * as DM from './{{dataSourceString}}'; // generated with @sisense/sdk-cli
import { QueryService } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'code-example',
  template: '<div>Total Rows: {{ queryResult.rows.length }}</div>',
})

export class CodeExample {
    queryResult: QueryResultData = { rows: [], columns: [] };

    constructor(private queryService: QueryService) {}

    async ngOnInit(): Promise<void> {
      const queryProps = {
        dataSource: DM.DataSource,
        dimensions: {{dimensionsString}},
        measures: {{measuresString}},
        filters: {{filtersString}},
        highlights: {{highlightsString}},
      }
      const { data } = await this.queryService.executeQuery(queryProps);
      this.queryResult = data as QueryResultData;
    }
}
`,
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

const { data, isLoading, isError } = useExecuteQueryByWidgetId({
  widgetOid: "{{widgetOid}}",
  dashboardOid: "{{dashboardOid}}"
});
</script>
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isError">Error</div>
    <div v-else-if="data">Total Rows: {{data.rows.length}}</div>
  </div>
</template>
`,
    executeQueryWidgetTmpl: `<script setup lang="ts">
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
const { data, isLoading, isError } = useExecuteQuery(queryProps);
</script>
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isError">Error</div>
    <div v-else-if="data">Total Rows: {{data.rows.length}}</div>
  </div>
</template>`,
  },
};
