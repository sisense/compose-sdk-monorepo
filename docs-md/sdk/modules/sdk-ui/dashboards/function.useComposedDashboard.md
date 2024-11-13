---
title: useComposedDashboard
---

# Function useComposedDashboard <Badge type="alpha" text="Alpha" />

> **useComposedDashboard**<`D`>(...`args`): `object`

React hook that takes in separate dashboard elements and
composes them into a coordinated dashboard with change detection, cross filtering, and drill down.

## Type parameters

| Parameter |
| :------ |
| `D` *extends* [`ComposableDashboardProps`](../type-aliases/type-alias.ComposableDashboardProps.md) \| [`DashboardProps`](../interfaces/interface.DashboardProps.md) |

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [`D`, `UseComposedDashboardOptions?`] |

## Returns

### `dashboard`

**dashboard**: `D`

### `setFilters`

**setFilters**: (`filters`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filters` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] |

#### Returns

`void`