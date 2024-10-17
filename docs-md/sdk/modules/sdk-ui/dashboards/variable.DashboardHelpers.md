---
title: DashboardHelpers
---

# Variable DashboardHelpers

> **`const`** **DashboardHelpers**: `object`

Utility functions to manipulate DashboardProps.

## Type declaration

### `addFilter`

**addFilter**: (`dashboard`, `newFilter`) => [`DashboardProps`](../interfaces/interface.DashboardProps.md)

Creates a new dashboard instance with an additional filter added to its existing filters.

This function does not modify the original dashboard; instead, it returns a new dashboard with the added filter.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../interfaces/interface.DashboardProps.md) | The original dashboard (`DashboardProps`) to which the filter will be added. |
| `newFilter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) | The filter to add to the dashboard. |

#### Returns

[`DashboardProps`](../interfaces/interface.DashboardProps.md)

A new dashboard instance with the new filter added.

#### Example

Add a new filter to a dashboard.
```ts
const existingDashboard: DashboardProps = {...};
const newFilter: Filter = {...};
const updatedDashboard = addFilter(existingDashboard, newFilter);
```

***

### `addFilters`

**addFilters**: (`dashboard`, `newFilters`) => [`DashboardProps`](../interfaces/interface.DashboardProps.md)

Creates a new dashboard instance with additional filters added to its existing filters.

This function does not modify the original dashboard; instead, it returns a new dashboard with the added filters.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../interfaces/interface.DashboardProps.md) | The original dashboard (`DashboardProps`) to which the filters will be added. |
| `newFilters` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] | An array of filters to add to the dashboard. |

#### Returns

[`DashboardProps`](../interfaces/interface.DashboardProps.md)

A new dashboard instance with the new filters added.

#### Example

Add multiple new filters to a dashboard.
```ts
const existingDashboard: DashboardProps = {...};
const newFilters: Filter[] = [{...}, {...}, ...];
const updatedDashboard = addFilters(existingDashboard, newFilters);
```

***

### `modifyFilter`

**modifyFilter**: (`dashboard`, `filterToModify`, `newFilter`) => [`DashboardProps`](../interfaces/interface.DashboardProps.md)

Creates a new dashboard instance with a specific filter modified.

This function searches for a filter with the same GUID as the provided `filterToModify` and replaces it with `newFilter`.
This function does not modify the original dashboard; instead, it returns a new dashboard with the updated filters.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../interfaces/interface.DashboardProps.md) | The original dashboard (`DashboardProps`) containing the filter to modify. |
| `filterToModify` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) | The existing filter to be modified. |
| `newFilter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) | The new filter to replace the existing one. |

#### Returns

[`DashboardProps`](../interfaces/interface.DashboardProps.md)

A new dashboard instance with the specified filter modified.

#### Example

Modify a filter in a dashboard.
```ts
const existingDashboard: DashboardProps = {...};
const filterToModify: Filter = {...};
const newFilter: Filter = {...};
const updatedDashboard = modifyFilter(existingDashboard, filterToModify, newFilter);
```

***

### `removeFilter`

**removeFilter**: (`dashboard`, `filter`) => [`DashboardProps`](../interfaces/interface.DashboardProps.md)

Creates a new dashboard instance with a specific filter removed.

This function removes the filter with the same GUID as the provided filter from the dashboard's filters.
This function does not modify the original dashboard; instead, it returns a new dashboard with the updated filters.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../interfaces/interface.DashboardProps.md) | The original dashboard (`DashboardProps`) from which to remove the filter. |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) | The filter to be removed. |

#### Returns

[`DashboardProps`](../interfaces/interface.DashboardProps.md)

A new dashboard instance with the specified filter removed.

#### Example

Remove a filter from a dashboard.
```ts
const existingDashboard: DashboardProps = {...};
const filterToRemove: Filter = {...};
const updatedDashboard = removeFilter(existingDashboard, filterToRemove);
```

***

### `replaceFilters`

**replaceFilters**: (`dashboard`, `newFilters`) => [`DashboardProps`](../interfaces/interface.DashboardProps.md)

Creates a new dashboard instance with its filters replaced by a new set of filters.

This function does not modify the original dashboard; instead, it returns a new dashboard with the updated filters.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../interfaces/interface.DashboardProps.md) | The original dashboard (`DashboardProps`) whose filters are to be replaced. |
| `newFilters` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] | An array of new filters to set on the dashboard. |

#### Returns

[`DashboardProps`](../interfaces/interface.DashboardProps.md)

A new dashboard instance with the updated filters.

#### Example

Replace all filters on a dashboard with a new set of filters.
```ts
const existingDashboard: DashboardProps = {...}
const newFilters: Filter[] = [{...}, {...}, ...];
const updatedDashboard = replaceFilters(existingDashboard, newFilters);
```
