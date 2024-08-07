import { CodeTemplates } from './types';

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
  },
};
