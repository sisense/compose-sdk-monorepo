---
title: useComposedDashboard
---

# Function useComposedDashboard

> **useComposedDashboard**<`D`>(`initialDashboard`, `options` = `{}`): `object`

A Vue composable function `useComposedDashboard` that takes in separate dashboard elements and
composes them into a coordinated dashboard with cross filtering, and change detection.

## Type parameters

| Parameter |
| :------ |
| `D` *extends* [`ComposableDashboardProps`](../interfaces/interface.ComposableDashboardProps.md) \| [`DashboardProps`](../interfaces/interface.DashboardProps.md) |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `initialDashboard` | [`MaybeRef`](../type-aliases/type-alias.MaybeRef.md)\< `D` \> |
| `options` | [`UseComposedDashboardOptions`](../../sdk-ui/type-aliases/type-alias.UseComposedDashboardOptions.md) |

## Returns

### `dashboard`

**dashboard**: `Ref`\< `D` \>

### `setFilters`

**setFilters**: (`filters`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filters` | [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] |

#### Returns

`void`

### `setWidgetsLayout`

**setWidgetsLayout**: (`newLayout`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `newLayout` | [`WidgetsPanelColumnLayout`](../interfaces/interface.WidgetsPanelColumnLayout.md) |

#### Returns

`void`

## Example

How to use `useComposedDashboard` within a Vue component:
```vue
<script setup lang="ts">
import { Widget, FilterTile, useComposedDashboard, type DashboardProps } from '@sisense/sdk-ui-vue';

const initialDashboardProps: DashboardProps = { ... };
const { dashboard } = useComposedDashboard(initialDashboardProps);
</script>
<template>
 <div>
   <FilterTile v-for="(filter, index) in dashboard.filters" :key="index" :filter="filter" />
   <Widget v-for="(widgetProps, index) in dashboard.widgets" :key="index" v-bind="widgetProps" />
 </div>
</template>
```

The composable returns an object with the following properties:
- `dashboard`: The composable dashboard object containing the current state of the dashboard.
- `setFilters`: API to set filters on the dashboard.
- `setWidgetsLayout`: API to set the layout of the widgets on the dashboard.
