export const MOCK_CODE_REACT_1 = `import { ChartWidget } from '@sisense/sdk-ui';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

export default function CodeExample() {
  return (
    <ChartWidget
      title={'bar chart of total of revenue by condition'}
      dataSource={DM.DataSource}
      chartType={'bar'}
      dataOptions={ {
    category: [
      DM.Commerce.Condition
    ],
    value: [
      {column: measureFactory.sum(DM.Commerce.Revenue, 'total of Revenue'), sortType: 'sortDesc'}
    ],
    breakBy: [],
  } }
      filters={ [
    filterFactory.members(DM.Country.Country, ['Cambodia', 'United States']),
    filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
    filterFactory.greaterThan(DM.Commerce.Revenue, 1000)
    ] }
    />
  );
}`;

export const MOCK_CODE_ANGULAR_1 = `import { Component } from '@angular/core';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

@Component({
    selector: 'code-example',
    template: \`
      <csdk-chart-widget
        chartType='bar'
        [dataSource]='DM.DataSource'
        [dataOptions]='dataOptions'
        [filters]='filters'
      />
    \`
})
export class CodeExample {
    DM = DM;
    dataOptions = {
    category: [
      DM.Commerce.Condition
    ],
    value: [
      {column: measureFactory.sum(DM.Commerce.Revenue, 'total of Revenue'), sortType: 'sortDesc'}
    ],
    breakBy: [],
  };
    filters = [
    filterFactory.members(DM.Country.Country, ['Cambodia', 'United States']),
    filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
    filterFactory.greaterThan(DM.Commerce.Revenue, 1000)
    ];
}`;

export const MOCK_CODE_VUE_1 = `<script setup lang="ts">
  import { ref } from 'vue';
  import { ChartWidget } from '@sisense/sdk-ui-vue';
  import { measureFactory, filterFactory } from '@sisense/sdk-data';
  import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

  const dataOptions = ref({
    category: [
      DM.Commerce.Condition
    ],
    value: [
      {column: measureFactory.sum(DM.Commerce.Revenue, 'total of Revenue'), sortType: 'sortDesc'}
    ],
    breakBy: [],
  });
  const filters = ref([
    filterFactory.members(DM.Country.Country, ['Cambodia', 'United States']),
    filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
    filterFactory.greaterThan(DM.Commerce.Revenue, 1000)
    ]);
</script>

<template>
  <ChartWidget
    chartType="bar"
    :dataOptions="dataOptions"
    :filters="filters"
    :dataSource="DM.DataSource"
    title="bar chart of total of revenue by condition" />
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
    :widgetOid="SOME_WIDGET_BY_ID"
    :dashboardOid="SOME_DASHBOARD_OID"
  />
</template>
`;
