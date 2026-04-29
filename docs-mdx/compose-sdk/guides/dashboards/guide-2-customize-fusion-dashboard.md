# 2 | Customize Fusion Dashboard

## Generic `Dashboard` Component

You can write a little more code to embed the dashboard with customizations. In the following example, we use a combination of the `useGetDashboardModel` hook and `Dashboard` component, in lieu of the `DashboardById` component.

##### React

```ts
import { Dashboard, dashboardModelTranslator, useGetDashboardModel } from '@sisense/sdk-ui';

const CodeExample = () => {
  // DashboardModel is the data representation of a Fusion dashboard in Compose SDK
  const { dashboard } = useGetDashboardModel({
    dashboardOid: 'your-dashboard-oid',
    includeFilters: true,
    includeWidgets: true,
  });

  if (!dashboard) {
    return null;
  }

  // DashboardProps is a set of properties for the generic Dashboard component
  const { title, widgets, layoutOptions, filters, styleOptions, widgetsOptions } =
    dashboardModelTranslator.toDashboardProps(dashboard);

  return (
    <Dashboard
      title={title}
      layoutOptions={layoutOptions}
      widgets={widgets}
      filters={filters}
      styleOptions={styleOptions}
      widgetsOptions={widgetsOptions}
    />
  );
};

export default CodeExample;
```

##### Angular

```ts
import { Component } from '@angular/core';
import {
  type DashboardProps,
  DashboardService,
  dashboardModelTranslator,
} from '@sisense/sdk-ui-angular';

@Component({
  selector: 'code-example',
  template: `
    <div style="width: 100vw">
      <csdk-dashboard
        *ngIf="dashboardProps"
        [title]="dashboardProps.title"
        [layoutOptions]="dashboardProps.layoutOptions"
        [widgets]="dashboardProps.widgets"
        [filters]="dashboardProps.filters"
        [defaultDataSource]="dashboardProps.defaultDataSource"
        [widgetsOptions]="dashboardProps.widgetsOptions"
      />
    </div>
  `,
})
export class CodeExampleComponent {
  dashboardProps: DashboardProps | null = null;

  constructor(private dashboardService: DashboardService) {}

  async ngOnInit(): Promise<void> {
    const dashboardModel = await this.dashboardService.getDashboardModel(
      '66fb233ae2c222003368dac1',
      { includeWidgets: true, includeFilters: true },
    );
    this.dashboardProps = dashboardModelTranslator.toDashboardProps(dashboardModel);
  }
}
```

##### Vue
```ts
<script setup lang="ts">
import { dashboardModelTranslator, useGetDashboardModel, Dashboard } from '@sisense/sdk-ui-vue';
import { computed } from 'vue';

const { dashboard } = useGetDashboardModel({
  dashboardOid: 'your-dashboard-oid',
  includeWidgets: true,
  includeFilters: true,
});

const dashboardProps = computed(() =>
  dashboard.value ? dashboardModelTranslator.toDashboardProps(dashboard.value) : null,
);
</script>
<template>
  <div style="width: 100vw">
    <Dashboard
      v-if="dashboardProps"
      :title="dashboardProps.title"
      :layoutOptions="dashboardProps.layoutOptions"
      :widgets="dashboardProps.widgets"
      :filters="dashboardProps.filters"
      :defaultDataSource="dashboardProps.defaultDataSource"
      :widgetsOptions="dashboardProps.widgetsOptions"
      :styleOptions="dashboardProps.styleOptions"
    />
  </div>
</template>
```

![Embedded Sample ECommerce Dashboard](../../img/dashboard-guides/fusion-dashboard-light-theme.png 'Embedded Sample ECommerce Dashboard')

As shown in the code, there is a clear separation between `DashboardModel` and `DashboardProps`.

In Compose SDK, `DashboardModel` is the data representation of a Fusion dashboard – in other words, metadata of a Fusion dashboard.

On the other hand, `DashboardProps` is a set of properties for the generic `Dashboard` component.

Following the design principle of Separation of Concerns, `DashboardProps` and `Dashboard` are no longer coupled to the `DashboardModel`.

It is still very simple to translate the `DashboardModel` to `DashboardProps` using the provided utilty function, `dashboardModelTranslator.toDashboardProps`, and you have access to all elements of the dashboard for manipulation, which we will demonstrate in the next example.

## Customize Embedded Fusion Dashboard

Here, we add a dashboard filter on the `Gender` dimension. We also customize the look of the charts by adding rounded corners for the bars.

Basically, a dashboard and its props are composed of existing building blocks in Compose SDK including `ChartWidget` and `*FilterTile`. Any APIs supported in chart widgets like `onBeforeRender`, `onDataPointClick` are also available for manipulation in `DashboardProps.widgets`.

##### React

```ts
import { Dashboard, dashboardModelTranslator, useGetDashboardModel } from '@sisense/sdk-ui';
import * as DM from './sample-ecommerce';
import { filterFactory } from '@sisense/sdk-data';

const CodeExample = () => {
  // DashboardModel is the data representation of a Fusion dashboard in Compose SDK
  const { dashboard } = useGetDashboardModel({
    dashboardOid: 'your-dashboard-oid',
    includeFilters: true,
    includeWidgets: true,
  });

  if (!dashboard) {
    return null;
  }

  // DashboardProps is a set of properties for the Dashboard component
  const { title, widgets, layoutOptions, filters, styleOptions, widgetsOptions } =
    dashboardModelTranslator.toDashboardProps(dashboard);

  // Add a filter to the dashboard filters
  const updatedFilters = [...filters, filterFactory.members(DM.Commerce.Gender, ['Male'])];

  // Customize the look of the chart widgets that are based on Highcharts
  const updatedWidgets = widgets.map((widget) => ({
    ...widget,
    onBeforeRender: (highchartsOptions: any) => {
      highchartsOptions.series.forEach((s: any) => {
        s.borderRadiusTopLeft = `10px`;
        s.borderRadiusTopRight = `10px`;
      });
      return highchartsOptions;
    },
  }));

  return (
    <Dashboard
      title={title}
      layoutOptions={layoutOptions}
      widgets={updatedWidgets}
      filters={updatedFilters}
      styleOptions={styleOptions}
      widgetsOptions={widgetsOptions}
    />
  );
};

export default CodeExample;
```

##### Angular

```ts
import { Component } from '@angular/core';
import {
  type DashboardProps,
  DashboardService,
  dashboardModelTranslator,
} from '@sisense/sdk-ui-angular';
import * as DM from './sample-ecommerce';
import { filterFactory } from '@sisense/sdk-data';

@Component({
  selector: 'code-example',
  template: `
    <div style="width: 100vw">
      <csdk-dashboard
        *ngIf="dashboardProps"
        [title]="dashboardProps.title"
        [layoutOptions]="dashboardProps.layoutOptions"
        [widgets]="dashboardProps.widgets"
        [filters]="dashboardProps.filters"
        [defaultDataSource]="dashboardProps.defaultDataSource"
        [widgetsOptions]="dashboardProps.widgetsOptions"
      />
    </div>
  `,
})
export class CodeExampleComponent {
  dashboardProps: DashboardProps | null = null;

  constructor(private dashboardService: DashboardService) {}

  async ngOnInit(): Promise<void> {
    const dashboardModel = await this.dashboardService.getDashboardModel(
      'your-dashboard-oid',
      { includeWidgets: true, includeFilters: true },
    );

    this.dashboardProps = dashboardModelTranslator.toDashboardProps(dashboardModel);

    const { filters, widgets } = this.dashboardProps;

    // Add a filter to the dashboard filters
    this.dashboardProps.filters = [
      ...(filters ?? []),
      filterFactory.members(DM.Commerce.Gender, ['Male']),
    ];

    // Customize the look of the chart widgets that are based on Highcharts
    this.dashboardProps.widgets = widgets.map((widget) => ({
      ...widget,
      onBeforeRender: (highchartsOptions: any) => {
        highchartsOptions.series.forEach((s: any) => {
          s.borderRadiusTopLeft = `10px`;
          s.borderRadiusTopRight = `10px`;
        });
        return highchartsOptions;
      },
    }));
  }
}
```

##### Vue
```ts
<script setup lang="ts">
import { filterFactory } from '@sisense/sdk-data';
import { dashboardModelTranslator, useGetDashboardModel, Dashboard } from '@sisense/sdk-ui-vue';
import * as DM from '../assets/sample-ecommerce-model';
import { computed } from 'vue';

const { dashboard } = useGetDashboardModel({
  dashboardOid: '66fb233ae2c222003368dac1',
  includeWidgets: true,
  includeFilters: true,
});

const dashboardProps = computed(() => {
  if (!dashboard.value) {
    return null;
  }

  const props = dashboardModelTranslator.toDashboardProps(dashboard.value);

  return {
    ...props,
    // Add a filter to the dashboard filters
    filters: [...props.filters, filterFactory.members(DM.Commerce.Gender, ['Male'])],
    // Customize the look of the chart widgets that are based on Highcharts
    widgets: props.widgets.map((widget) => ({
      ...widget,
      onBeforeRender: (highchartsOptions: any) => {
        highchartsOptions.series.forEach((s: any) => {
          s.borderRadiusTopLeft = `10px`;
          s.borderRadiusTopRight = `10px`;
        });
        return highchartsOptions;
      },
    })),
  };
});
</script>
<template>
  <div style="width: 100vw">
    <Dashboard
      v-if="dashboardProps"
      :title="dashboardProps.title"
      :layoutOptions="dashboardProps.layoutOptions"
      :widgets="dashboardProps.widgets"
      :filters="dashboardProps.filters"
      :defaultDataSource="dashboardProps.defaultDataSource"
      :widgetsOptions="dashboardProps.widgetsOptions"
      :styleOptions="dashboardProps.styleOptions"
    />
  </div>
</template>
```

![Embedded Sample ECommerce Dashboard with Customizations](../../img/dashboard-guides/fusion-dashboard-customized.png 'Embedded Sample ECommerce Dashboard with Customizations')


::: tip Note
Alternative to manipulating `DashboardProps.filters` directly, you can use dashboard helper functions available from each of the `sdk-ui-*` packages.
:::


## Next Up

In this section you learned how to embed a Fusion dashboard and customize it to your specific needs using the `Dashboard` component. In the next section, you'll see how to compose a dashboard fully in code.

Go to the [next lesson](./guide-3-compose-dashboard-in-code.md).
