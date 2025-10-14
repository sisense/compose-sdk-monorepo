---
title: ComposedDashboardResult
---

# Type alias ComposedDashboardResult`<D>`

> **ComposedDashboardResult**: <`D`> `object`

Result of the [useComposedDashboard](../dashboards/function.useComposedDashboard.md) hook.

## Type parameters

| Parameter |
| :------ |
| `D` *extends* [`ComposableDashboardProps`](type-alias.ComposableDashboardProps.md) \| [`DashboardProps`](../interfaces/interface.DashboardProps.md) |

## Type declaration

### `dashboard`

**dashboard**: `D`

The composable dashboard object containing the current state of the dashboard.

***

### `setFilters`

**setFilters**: (`filters`) => `void`

API to set filters on the dashboard.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filters` | [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] |

#### Returns

`void`

***

### `setWidgetsLayout`

**setWidgetsLayout**: (`newLayout`) => `void`

API to set the layout of the widgets on the dashboard.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `newLayout` | [`WidgetsPanelLayout`](type-alias.WidgetsPanelLayout.md) |

#### Returns

`void`
