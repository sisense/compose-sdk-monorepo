---
title: useComposedDashboard
---

# Function useComposedDashboard

> **useComposedDashboard**<`D`>(`initialDashboard`, `options`? = `{}`): [`ComposedDashboardResult`](../type-aliases/type-alias.ComposedDashboardResult.md)\< `D` \>

React hook that takes in separate dashboard elements and
composes them into a coordinated dashboard with change detection, cross filtering, and drill down.

## Type parameters

| Parameter | Description |
| :------ | :------ |
| `D` *extends* [`ComposableDashboardProps`](../type-aliases/type-alias.ComposableDashboardProps.md) \| [`DashboardProps`](../interfaces/interface.DashboardProps.md) | The type parameter for a dashboard properties, restricted to ComposableDashboardProps or DashboardProps |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `initialDashboard` | `D` | set of properties for the Dashboard component |
| `options`? | [`UseComposedDashboardOptions`](../type-aliases/type-alias.UseComposedDashboardOptions.md) | Options for the composable. |

## Returns

[`ComposedDashboardResult`](../type-aliases/type-alias.ComposedDashboardResult.md)\< `D` \>

An object containing the composed dashboard and APIs to interact with it.

## Example

```ts
import { useComposedDashboard } from '@sisense/sdk-ui/dashboard/use-composed-dashboard.js';
import { Widget } from '@sisense/sdk-ui';
import { DashboardProps } from '@/dashboard/types.js';
import { FilterTile } from '@/filters';

const CodeExample = () => {
  const dashboardProps: DashboardProps = { ... };

  const {
    dashboard: { title, widgets, filters = [] }
  } = useComposedDashboard(dashboardProps);

  return (
    <div>
      <span>{title}</span>
      <div>
        {widgets.map((widget) => (
          <Widget key={widget.id} {...widget} />
        ))}
      </div>

      {Array.isArray(filters) ? filters.map((filter) => (
        <FilterTile
          key={filter.name}
          filter={filter}
          onChange={(filter) => console.log('Updated filter', filter)}
        />
      )) : null}
    </div>
  );
}
  export default CodeExample;
```
