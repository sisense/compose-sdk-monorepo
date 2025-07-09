# 1 | Embed Fusion Dashboard

## Component `DashboardById`

To embed a Fusion dashboard into your application as-is, you can use component `DashboardById` available from the `sdk-ui-*` package. This method is the quickest and simplest, but it comes with limited customization options for the dashboard.

The following code examples and screenshots use the Sample ECommerce dashboard identified by OID pre-existing in a Sisense instance.

##### React

```ts
import { DashboardById } from '@sisense/sdk-ui';

const CodeExample = () => {
  return (
    <DashboardById dashboardOid='your-dashboard-oid'/>
  );
};

export default CodeExample;
```

##### Angular

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'code-example',
  template: `
    <div style="width: 100vw;">
      <csdk-dashboard-by-id *ngIf="dashboardOid" [dashboardOid]="dashboardOid" />
    </div>
  `,
})
export class CodeExampleComponent {
  dashboardOid = 'your-dashboard-oid';
}
```

##### Vue
```ts
<script setup lang="ts">
import { DashboardById } from '@sisense/sdk-ui-vue';
import { ref } from 'vue';

const dashboardOid = ref<string>('your-dashboard-oid');
</script>
<template>
  <div style="width: 100vw"><DashboardById v-if="dashboardOid" :dashboardOid="dashboardOid" /></div>
</template>
```

![Embedded Sample ECommerce Dashboard](../../img/dashboard-guides/fusion-dashboard-light-theme.png 'Embedded Sample ECommerce Dashboard')

::: tip Note
Follow [this guide](../custom-widgets/custom-widgets.md) to learn how to define your own custom widget component, and have it rendered in place of a corresponding Fusion widget plugin when using the `DashboardById` component.
:::

## Simple customization

While `DashboardById` does not allow customizations, you can still use a `ThemeProvider` (React and Vue) or `ThemeService` (Angular) to apply a consistent look and feel to the dashboard elements including toolbar, widgets panel, and filters panel.

The following React code example renders the dashboard in dark mode:

```ts
import { DashboardById, ThemeProvider, getDefaultThemeSettings } from '@sisense/sdk-ui';

const CodeExample = () => {
  const darkTheme = getDefaultThemeSettings(true);

  return (
    <ThemeProvider theme={darkTheme}>
      <DashboardById dashboardOid='your-dashboard-oid'/>
    </ThemeProvider>
  );
};

export default CodeExample;
```

![Embedded Sample ECommerce Dashboard in Dark Mode](../../img/dashboard-guides/fusion-dashboard-dark-theme.png 'Embedded Sample ECommerce Dashboard in Dark Mode')


## Next Up

In this section you learned how to embed a Fusion dashboard using component `DashboardById`. In the next section, you'll see how to customize the elements of the embedded Fusion dashboard.

Go to the [next lesson](./guide-2-customize-fusion-dashboard.md).
