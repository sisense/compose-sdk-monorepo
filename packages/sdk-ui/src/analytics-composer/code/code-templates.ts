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
  },
};